import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Shipment {
  id: string;
  trackingNumber: string;
  clientName: string;
  clientEmail: string;
  origin: string;
  destination: string;
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  currentCoords: [number, number] | null;
  status: 'pending' | 'in_transit' | 'paused' | 'delivered' | 'cancelled';
  pauseReason?: string;
  transportMode: 'road' | 'sea' | 'air' | 'rail';
  progress: number;
  estimatedArrival: string;
  createdAt: string;
  updatedAt: string;
  weight: string;
  dimensions: string;
  packageType: string;
  route: [number, number][];
  history: ShipmentEvent[];
}

export interface ShipmentEvent {
  id: string;
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  shipmentId: string;
  sender: 'admin' | 'client';
  message: string;
  timestamp: string;
  readByAdmin?: boolean;
  readByClient?: boolean;
}

export interface TicketItem {
  description: string;
  amount: number;
}

export interface Ticket {
  id: string;
  shipmentId: string;
  ticketNumber: string;
  ticketType: 'paid' | 'pending';
  title: string;
  amount: number;
  currency: string;
  items: TicketItem[];
  notes: string;
  issuedTo: string;
  issuedBy: string;
  createdAt: string;
  dueDate?: string;
  paymentMethod?: string;
  taxRate?: number;
  discount?: number;
}

interface AppState {
  shipments: Shipment[];
  messages: ChatMessage[];
  tickets: Ticket[];
  isAdminLoggedIn: boolean;
  loading: boolean;
  addShipment: (shipment: Shipment) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  deleteShipment: (id: string) => void;
  addMessage: (msg: ChatMessage) => void;
  markMessagesRead: (shipmentId: string, role: 'admin' | 'client') => void;
  addTicket: (ticket: Ticket) => void;
  deleteTicket: (id: string) => void;
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  getShipmentByTracking: (tracking: string) => Shipment | undefined;
  getTicketsForShipment: (shipmentId: string) => Ticket[];
  trackShipment: (tracking: string) => Promise<TrackResult | null>;
  sendClientMessage: (tracking: string, message: string) => Promise<void>;
  getClientMessages: (tracking: string) => Promise<ChatMessage[]>;
  markClientRead: (tracking: string) => Promise<void>;
}

export interface TrackResult {
  shipment: Shipment;
  tickets: Ticket[];
  messages: ChatMessage[];
}

const AppContext = createContext<AppState | null>(null);

const generateTrackingNumber = () => {
  const prefix = 'FTP';
  const num = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${num}`;
};

// Convert DB row to Shipment
const rowToShipment = (row: any): Shipment => ({
  id: row.id,
  trackingNumber: row.tracking_number,
  clientName: row.client_name,
  clientEmail: row.client_email || '',
  origin: row.origin,
  destination: row.destination,
  originCoords: row.origin_coords as [number, number] | null,
  destCoords: row.dest_coords as [number, number] | null,
  currentCoords: row.current_coords as [number, number] | null,
  status: row.status,
  pauseReason: row.pause_reason || undefined,
  transportMode: (row.transport_mode as Shipment['transportMode']) || 'road',
  progress: row.progress,
  estimatedArrival: row.estimated_arrival || '',
  createdAt: row.created_at?.split('T')[0] || '',
  updatedAt: row.updated_at?.split('T')[0] || '',
  weight: row.weight || '',
  dimensions: row.dimensions || '',
  packageType: row.package_type || 'Standard Box',
  route: (row.route as [number, number][]) || [],
  history: (row.history as ShipmentEvent[]) || [],
});

const rowToMessage = (m: any): ChatMessage => ({
  id: m.id,
  shipmentId: m.shipment_id,
  sender: m.sender as 'admin' | 'client',
  message: m.message,
  timestamp: new Date(m.created_at).toLocaleString(),
  readByAdmin: m.read_by_admin,
  readByClient: m.read_by_client,
});

const rowToTicket = (t: any): Ticket => ({
  id: t.id,
  shipmentId: t.shipment_id,
  ticketNumber: t.ticket_number,
  ticketType: t.ticket_type as 'paid' | 'pending',
  title: t.title,
  amount: Number(t.amount),
  currency: t.currency,
  items: (t.items as TicketItem[]) || [],
  notes: t.notes || '',
  issuedTo: t.issued_to || '',
  issuedBy: t.issued_by || 'EuroTransit Admin',
  createdAt: t.created_at,
  dueDate: t.due_date || undefined,
  paymentMethod: t.payment_method || '',
  taxRate: Number(t.tax_rate || 0),
  discount: Number(t.discount || 0),
});

const ADMIN_TOKEN_KEY = 'eurotransit_admin_token';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [loading, setLoading] = useState(false);

  const isAdminLoggedIn = !!adminToken;

  // Helper: call the secure admin edge function with the stored token.
  const adminInvoke = useCallback(async (action: string, data?: any) => {
    const token = adminToken ?? localStorage.getItem(ADMIN_TOKEN_KEY);
    const { data: res, error } = await supabase.functions.invoke('admin-api', {
      body: { action, data },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (error) {
      // Token likely expired/invalid → force logout
      if ((error as any).context?.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdminToken(null);
      }
      throw error;
    }
    return res;
  }, [adminToken]);

  // Load all admin data once authenticated.
  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminInvoke('load');
      setShipments((res.shipments ?? []).map(rowToShipment));
      setMessages((res.messages ?? []).map(rowToMessage));
      setTickets((res.tickets ?? []).map(rowToTicket));
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  }, [adminInvoke]);

  useEffect(() => {
    if (!adminToken) return;
    loadAdminData();
    const interval = setInterval(() => { loadAdminData(); }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  const addShipment = useCallback(async (shipment: Shipment) => {
    setShipments(prev => [shipment, ...prev]);
    await adminInvoke('addShipment', {
      id: shipment.id,
      tracking_number: shipment.trackingNumber,
      client_name: shipment.clientName,
      client_email: shipment.clientEmail,
      origin: shipment.origin,
      destination: shipment.destination,
      origin_coords: shipment.originCoords as any,
      dest_coords: shipment.destCoords as any,
      current_coords: shipment.currentCoords as any,
      status: shipment.status,
      pause_reason: shipment.pauseReason || null,
      transport_mode: shipment.transportMode,
      progress: shipment.progress,
      estimated_arrival: shipment.estimatedArrival,
      weight: shipment.weight,
      dimensions: shipment.dimensions,
      package_type: shipment.packageType,
      route: shipment.route as any,
      history: shipment.history as any,
    });
  }, [adminInvoke]);

  const updateShipment = useCallback(async (id: string, updates: Partial<Shipment>) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : s));
    const dbUpdates: any = {};
    if (updates.trackingNumber !== undefined) dbUpdates.tracking_number = updates.trackingNumber;
    if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
    if (updates.clientEmail !== undefined) dbUpdates.client_email = updates.clientEmail;
    if (updates.origin !== undefined) dbUpdates.origin = updates.origin;
    if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
    if (updates.originCoords !== undefined) dbUpdates.origin_coords = updates.originCoords;
    if (updates.destCoords !== undefined) dbUpdates.dest_coords = updates.destCoords;
    if (updates.currentCoords !== undefined) dbUpdates.current_coords = updates.currentCoords;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.pauseReason !== undefined) dbUpdates.pause_reason = updates.pauseReason;
    if (updates.transportMode !== undefined) dbUpdates.transport_mode = updates.transportMode;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.estimatedArrival !== undefined) dbUpdates.estimated_arrival = updates.estimatedArrival;
    if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
    if (updates.dimensions !== undefined) dbUpdates.dimensions = updates.dimensions;
    if (updates.packageType !== undefined) dbUpdates.package_type = updates.packageType;
    if (updates.route !== undefined) dbUpdates.route = updates.route;
    if (updates.history !== undefined) dbUpdates.history = updates.history;
    await adminInvoke('updateShipment', { id, updates: dbUpdates });
  }, [adminInvoke]);

  const deleteShipment = useCallback(async (id: string) => {
    setShipments(prev => prev.filter(s => s.id !== id));
    await adminInvoke('deleteShipment', { id });
  }, [adminInvoke]);

  // Admin-side message send (ChatWidget in admin context).
  const addMessage = useCallback(async (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
    await adminInvoke('addMessage', {
      id: msg.id,
      shipment_id: msg.shipmentId,
      sender: 'admin',
      message: msg.message,
      read_by_admin: true,
      read_by_client: false,
    });
  }, [adminInvoke]);

  const markMessagesRead = useCallback(async (shipmentId: string, role: 'admin' | 'client') => {
    setMessages(prev => prev.map(m => m.shipmentId === shipmentId
      ? { ...m, [role === 'admin' ? 'readByAdmin' : 'readByClient']: true } : m));
    if (role === 'admin') {
      await adminInvoke('markRead', { shipmentId });
    }
  }, [adminInvoke]);

  const addTicket = useCallback(async (ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    await adminInvoke('addTicket', {
      id: ticket.id,
      shipment_id: ticket.shipmentId,
      ticket_number: ticket.ticketNumber,
      ticket_type: ticket.ticketType,
      title: ticket.title,
      amount: ticket.amount,
      currency: ticket.currency,
      items: ticket.items as any,
      notes: ticket.notes,
      issued_to: ticket.issuedTo,
      issued_by: ticket.issuedBy,
      due_date: ticket.dueDate || null,
      payment_method: ticket.paymentMethod || '',
      tax_rate: ticket.taxRate || 0,
      discount: ticket.discount || 0,
    });
  }, [adminInvoke]);

  const deleteTicket = useCallback(async (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    await adminInvoke('deleteTicket', { id });
  }, [adminInvoke]);

  const loginAdmin = useCallback(async (username: string, password: string) => {
    try {
      const { data: res, error } = await supabase.functions.invoke('admin-api', {
        body: { action: 'login', data: { username, password } },
      });
      if (error || !res?.token) return false;
      localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
      setAdminToken(res.token);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
    setShipments([]);
    setTickets([]);
    setMessages([]);
  }, []);

  const getShipmentByTracking = useCallback((tracking: string) => {
    return shipments.find(s => s.trackingNumber.toLowerCase() === tracking.toLowerCase());
  }, [shipments]);

  const getTicketsForShipment = useCallback((shipmentId: string) => {
    return tickets.filter(t => t.shipmentId === shipmentId);
  }, [tickets]);

  // ---- Public (client) tracking via secure edge function ----
  const trackShipment = useCallback(async (tracking: string): Promise<TrackResult | null> => {
    const { data: res, error } = await supabase.functions.invoke('public-api', {
      body: { action: 'track', data: { trackingNumber: tracking.trim() } },
    });
    if (error) return null;
    // New multi-admin client tracking codes return { client, events }.
    if (res?.client) {
      const c = res.client;
      const statusMap: Record<string, Shipment['status']> = {
        pending: 'pending', in_transit: 'in_transit', delivered: 'delivered', failed: 'cancelled',
      };
      const synthetic: Shipment = {
        id: c.tracking_code,
        trackingNumber: c.tracking_code,
        clientName: c.client_name,
        clientEmail: '',
        origin: c.origin || '',
        destination: c.destination || '',
        originCoords: null,
        destCoords: null,
        currentCoords: null,
        status: statusMap[c.status] || 'pending',
        transportMode: 'road',
        progress: c.status === 'delivered' ? 100 : c.status === 'in_transit' ? 50 : 0,
        estimatedArrival: '',
        createdAt: (c.created_at || '').split('T')[0] || '',
        updatedAt: (c.updated_at || '').split('T')[0] || '',
        weight: '',
        dimensions: '',
        packageType: c.shipment_description || 'Standard Box',
        route: [],
        history: (res.events ?? []).map((ev: any) => ({
          id: `${ev.event_time}-${ev.event_description}`,
          timestamp: new Date(ev.event_time).toLocaleString(),
          status: '',
          location: ev.location || '',
          description: ev.event_description,
        })),
      };
      return { shipment: synthetic, tickets: (res.tickets ?? []).map(rowToTicket), messages: [] };
    }
    if (!res?.shipment) return null;
    return {
      shipment: rowToShipment(res.shipment),
      tickets: (res.tickets ?? []).map(rowToTicket),
      messages: (res.messages ?? []).map(rowToMessage),
    };
  }, []);

  const sendClientMessage = useCallback(async (tracking: string, message: string) => {
    await supabase.functions.invoke('public-api', {
      body: { action: 'sendMessage', data: { trackingNumber: tracking.trim(), message } },
    });
  }, []);

  const getClientMessages = useCallback(async (tracking: string): Promise<ChatMessage[]> => {
    const { data: res, error } = await supabase.functions.invoke('public-api', {
      body: { action: 'getMessages', data: { trackingNumber: tracking.trim() } },
    });
    if (error || !res?.messages) return [];
    return res.messages.map(rowToMessage);
  }, []);

  const markClientRead = useCallback(async (tracking: string) => {
    await supabase.functions.invoke('public-api', {
      body: { action: 'markRead', data: { trackingNumber: tracking.trim() } },
    });
  }, []);

  return (
    <AppContext.Provider value={{
      shipments, messages, tickets, isAdminLoggedIn, loading,
      addShipment, updateShipment, deleteShipment,
      addMessage, markMessagesRead, addTicket, deleteTicket,
      loginAdmin, logoutAdmin, getShipmentByTracking, getTicketsForShipment,
      trackShipment, sendClientMessage, getClientMessages, markClientRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export { generateTrackingNumber };
