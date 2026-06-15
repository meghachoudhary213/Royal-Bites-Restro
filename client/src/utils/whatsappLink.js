export const getWhatsAppLink = (message = "Hi Royal Bites, I want to explore the menu.") => {
  const number = (import.meta.env.VITE_WHATSAPP_NUMBER || "14155238886").replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};
