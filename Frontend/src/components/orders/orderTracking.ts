export type Status = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type HistoryEvent = { id: number; fromStatus: Status | null; toStatus: Status; createdAt: string; changedByRole: string; note?: string | null };
export const stages: Status[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
export const labels: Record<Status, string> = {
  PENDING: 'Chờ xác nhận', PROCESSING: 'Đang chuẩn bị hàng', SHIPPED: 'Đang giao hàng', DELIVERED: 'Đã giao hàng', CANCELLED: 'Đã hủy'
};
export const descriptions: Record<Status, string> = {
  PENDING: 'Đơn hàng đã được tiếp nhận và đang chờ cửa hàng xác nhận',
  PROCESSING: 'Cửa hàng đang chuẩn bị các cuốn sách trong đơn',
  SHIPPED: 'Đơn đã được chuyển sang trạng thái giao hàng',
  DELIVERED: 'Đơn hàng được đánh dấu giao thành công',
  CANCELLED: 'Đơn hàng đã hủy, không tiếp tục giao'
};
export const roles: Record<string,string> = { CUSTOMER: 'Khách hàng', ADMIN: 'Cửa hàng', SYSTEM: 'Hệ thống' };
export function displayDate(date?: string) {return date ? new Date(date).toLocaleString('vi-VN', {hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'}) : 'Chưa cập nhật';}
export function validStatus(x: string): x is Status {return x in labels;}
