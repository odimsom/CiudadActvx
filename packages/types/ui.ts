// Tipos para la interfaz de usuario
export interface AnimationState {
  isLoading: boolean;
  isVisible: boolean;
  progress: number;
  duration: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ModalState {
  isOpen: boolean;
  type?: 'incident-form' | 'incident-details' | 'settings';
  data?: any;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UIState {
  loading: LoadingState;
  modal: ModalState;
  toast: ToastMessage[];
  theme: 'light' | 'dark' | 'system';
}
