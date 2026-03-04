import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "+919324632923";
  const message = encodeURIComponent("Hello, I need assistance from Nagar Sevak Office.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden sm:inline font-medium">WhatsApp Help</span>
    </a>
  );
};

export default WhatsAppButton;
