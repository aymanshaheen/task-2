export interface SwipeToDeleteOptions {
  width?: number;
  onDelete?: () => void;
  onReveal?: () => void;
  onClose?: () => void;
  hapticTrigger?: () => void;
}

export interface SwipeToDeleteReturn {
  gesture: any;
  rowStyle: any;
  rightActionStyle: any;
  translateX: any;
  revealed: any;
}

export function useSwipeToDelete(
  options?: SwipeToDeleteOptions
): SwipeToDeleteReturn;
