import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();
const subjects = new Set([
  'Tư vấn chọn sách', 'Hỗ trợ đặt hàng', 'Thông tin sản phẩm', 'Góp ý website', 'Vấn đề khác',
]);

// Công khai: tiếp nhận lời nhắn. Không công khai danh sách liên hệ để bảo vệ dữ liệu cá nhân.
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, email, subject, message } = req.body ?? {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanSubject = typeof subject === 'string' ? subject.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (cleanName.length < 2 || cleanName.length > 100 ||
      cleanEmail.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      !subjects.has(cleanSubject) || cleanMessage.length < 10 || cleanMessage.length > 3000) {
    res.status(400).json({ success: false, message: 'Thông tin liên hệ chưa hợp lệ. Vui lòng kiểm tra lại nội dung.' });
    return;
  }
  try {
    await prisma.contactMessage.create({ data: { name: cleanName, email: cleanEmail, subject: cleanSubject, message: cleanMessage } });
    res.status(201).json({ success: true, message: 'Đã tiếp nhận yêu cầu liên hệ.' });
  } catch (error) {
    console.error('[Contact] Lỗi lưu liên hệ:', error);
    res.status(500).json({ success: false, message: 'Không thể lưu lời nhắn lúc này. Vui lòng thử lại.' });
  }
});

export default router;
