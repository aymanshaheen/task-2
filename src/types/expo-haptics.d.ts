declare module "expo-haptics" {
  export enum ImpactFeedbackStyle {
    Light,
    Medium,
    Heavy,
  }
  export enum NotificationFeedbackType {
    Success,
    Warning,
    Error,
  }
  export function selectionAsync(): Promise<void>;
  export function impactAsync(style: ImpactFeedbackStyle): Promise<void>;
  export function notificationAsync(
    type: NotificationFeedbackType
  ): Promise<void>;
}
