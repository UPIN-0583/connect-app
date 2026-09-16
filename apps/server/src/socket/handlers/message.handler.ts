import { AuthSocket } from "../socket-types.js";
import { getIO } from "../socket-server.js";
import * as messageService from "../../services/message.service.js";
import * as conversationRepo from "../../repositories/conversation.repository.js";

export const registerMessageHandlers = (socket: AuthSocket) => {
  // Vì đã đi qua cổng auth, chúng ta chắc chắn có socket.user
  const user = socket.user!;

  // THAM GIA VÀO PHÒNG CHAT (JOIN ROOM)
  socket.on("conversation:join", async (data: { conversationId: string }) => {
    try {
      // Kiểm tra xem user này có nằm trong cuộc trò chuyện không?
      const isMember = await conversationRepo.isMember(data.conversationId, user.id);
      if (!isMember) {
        socket.emit("error", { message: "Từ chối truy cập: Bạn không phải thành viên phòng chat này." });
        return;
      }
      
      // Nếu hợp lệ, nhét socket này vào một "Căn phòng" (Room) có tên là: conversation:xyz
      const roomName = `conversation:${data.conversationId}`;
      socket.join(roomName);
      console.log(`[Socket] 🚪 User ${user.id} vừa tham gia phòng: ${roomName}`);
    } catch (err) {
      console.error("[Socket Error] Lỗi khi join room:", err);
    }
  });


  
  // TASK 6: GỬI VÀ PHÁT TÁN TIN NHẮN (GỌI SERVICE DAY 3)
  socket.on("message:send", async (data: { conversationId: string; content: string }) => {
     try {
       // Bước 1: Lưu thẳng vào PostgreSQL thông qua Message Service (Nguồn sự thật - Source of truth)
       const newMessage = await messageService.sendMessage({
         conversationId: data.conversationId,
         senderId: user.id,
         content: data.content
       });

       // Bước 2: Báo cho TẤT CẢ mọi người trong căn phòng đó biết có tin mới
       const roomName = `conversation:${data.conversationId}`;
       const io = getIO();
       
       // io.to(room).emit: Gửi cho toàn bộ người trong phòng (Kể cả máy của người vừa gửi để UI tự update)
       io.to(roomName).emit("message:new", newMessage);
       
     } catch (err: any) {
        socket.emit("error", { message: err.message || "Lỗi lưu tin nhắn" });
     }
  });


  // TASK 7: TRẠNG THÁI "ĐANG GÕ PHÍM..." (TYPING)
  socket.on("typing:start", (data: { conversationId: string }) => {
     // socket.to(): Gửi cho MỌI NGƯỜI KHÁC trong phòng, trừ bản thân người gõ
     socket.to(`conversation:${data.conversationId}`).emit("typing:start", { 
       userId: user.id, 
       conversationId: data.conversationId 
     });
  });

  socket.on("typing:stop", (data: { conversationId: string }) => {
     socket.to(`conversation:${data.conversationId}`).emit("typing:stop", { 
       userId: user.id, 
       conversationId: data.conversationId 
     });
  });
};