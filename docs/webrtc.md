# WebRTC Architecture & Signaling

## Mục tiêu
Cung cấp tính năng gọi thoại (Voice call) và gọi video (Video call) 1-1 và theo nhóm.

## Cấu trúc kết nối
1. **Signaling Server**: Sử dụng WebSocket (Socket.IO) trên backend Express để trao đổi SDP Offer, SDP Answer và ICE Candidates giữa các peers.
2. **STUN / TURN Server**:
   - **STUN**: Hỗ trợ tìm địa chỉ IP công khai của peer phía sau NAT.
   - **TURN**: Relay server trung chuyển traffic khi cả 2 peer nằm sau Symmetric NAT / Firewall khắt khe.
3. **P2P Media Flow**: Dữ liệu âm thanh/video truyền trực tiếp P2P giữa các trình duyệt mà không đi qua server backend.

## Biến môi trường phục vụ WebRTC
- `TURN_SERVER_URL`
- `TURN_USERNAME`
- `TURN_PASSWORD`
