import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, MapPin, CheckCircle, Copy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import axios from "axios";

import { useTenant } from "@/lib/TenantContext";

const categories = [
  { value: "WATER", label: "Water Supply", labelMr: "पाणी पुरवठा" },
  { value: "ROAD", label: "Road & Pothole", labelMr: "रस्ते आणि खड्डे" },
  { value: "GARBAGE", label: "Garbage Collection", labelMr: "कचरा संकलन" },
  { value: "STREET_LIGHT", label: "Street Light", labelMr: "रस्त्यावरील दिवे" },
  { value: "DRAINAGE", label: "Drainage", labelMr: "ड्रेनेज" },
  { value: "OTHER", label: "Other", labelMr: "इतर" },
];

const boothNumbers = Array.from({ length: 12 }, (_, i) => ({
  value: `Booth ${i + 1}`,
  label: `Booth ${i + 1}`,
}));

const Grievance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { office, loading: tenantLoading } = useTenant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    address: "",
    boothNumber: "",
    complaintCategory: "",
    complaintDescription: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // OTP Verification state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOTPSending, setIsOTPSending] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast({
            title: "Location Captured",
            description: "Your current location has been recorded.",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please try again.",
            variant: "destructive",
          });
          console.error("Location error:", error);
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleCopyComplaintId = async () => {
    try {
      await navigator.clipboard.writeText(complaintId);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Complaint ID copied to clipboard.",
      });
      // Reset copy icon after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy. Please copy manually.",
        variant: "destructive",
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!office?._id) {
      toast({
        title: "Identity Error",
        description: "Unable to identify the Nagar Sevak office. Please use a valid link.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Check if user is verified
      const checkUrl = `${import.meta.env.VITE_BACKEND_URL}/api/auth/check-status`;
      const statusRes = await axios.post(checkUrl, {
        mobileNumber: formData.mobileNumber,
        tenantId: office._id
      });

      if (statusRes.data.success && statusRes.data.isVerified) {
        // User already verified, auto-fill name if available and proceed
        if (statusRes.data.fullName) {
          setFormData(prev => ({ ...prev, fullName: statusRes.data.fullName }));
        }
        await performFinalSubmission();
      } else {
        // User NOT verified, send OTP and show modal
        await sendVerificationOTP();
      }
    } catch (error: any) {
      console.error("Error checking verification status:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to verify connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendVerificationOTP = async () => {
    setIsOTPSending(true);
    try {
      const otpUrl = `${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`;
      await axios.post(otpUrl, {
        mobileNumber: formData.mobileNumber,
        tenantId: office?._id
      });

      setShowOTPModal(true);
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your mobile number.",
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "OTP Failed",
        description: "Unable to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOTPSending(false);
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpValue.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const verifyUrl = `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`;
      const res = await axios.post(verifyUrl, {
        mobileNumber: formData.mobileNumber,
        tenantId: office?._id,
        otp: otpValue
      });

      if (res.data.success) {
        setShowOTPModal(false);
        toast({
          title: "Verified Successfully!",
          description: "Your mobile number has been verified.",
        });

        // Mobile verified, now submit the actual complaint
        setIsSubmitting(true);
        await performFinalSubmission();
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Verification Failed",
        description: "The code you entered is incorrect or expired.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const performFinalSubmission = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/complaints/register-complaint`;

      // Create FormData for multipart/form-data
      const submitData = new FormData();
      if (office?._id) submitData.append("tenantId", office._id);
      submitData.append("fullName", formData.fullName);
      submitData.append("mobileNumber", formData.mobileNumber);
      submitData.append("address", formData.address);
      submitData.append("boothNumber", formData.boothNumber);
      submitData.append("complaintCategory", formData.complaintCategory);
      submitData.append("complaintDescription", formData.complaintDescription);

      if (imageFile) submitData.append("image", imageFile);

      if (location) {
        const locationData = {
          type: "Point",
          coordinates: [location.longitude, location.latitude],
        };
        submitData.append("location", JSON.stringify(locationData));
      }

      const response = await axios.post(apiUrl, submitData);

      const generatedId = response.data.data?.complaintId || response.data.complaintId || `NS-${Date.now().toString().slice(-6)}`;
      setComplaintId(generatedId);
      setSubmitted(true);

      toast({
        title: "Complaint Registered Successfully!",
        description: `Your complaint ID is ${generatedId}`,
      });

      setFormData({
        fullName: "",
        mobileNumber: "",
        address: "",
        boothNumber: "",
        complaintCategory: "",
        complaintDescription: "",
      });
      setImageFile(null);
      setLocation(null);

    } catch (error: any) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to register complaint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="container max-w-lg">
          <div className="bg-card rounded-2xl p-8 lg:p-12 text-center shadow-lg animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Complaint Registered!
            </h1>
            <p className="text-muted-foreground mb-6">
              तुमची तक्रार यशस्वीरित्या नोंदवली गेली आहे।
            </p>
            <div className="bg-primary/5 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Your Complaint ID</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-2xl font-bold text-primary">{complaintId}</p>
                <button
                  onClick={handleCopyComplaintId}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                  title="Copy Complaint ID"
                >
                  {isCopied ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-primary group-hover:text-primary/80" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Save this ID to track your complaint status. You will also receive updates via SMS/WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="accent" className="flex-1" onClick={() => navigate("/track")}>
                Track Complaint
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setSubmitted(false)}>
                Register Another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-2 mb-4">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Citizen Grievance Portal</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Register Your Complaint
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            तुमची तक्रार नोंदवा। Fill in the details below and our team will address your concern promptly.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl p-6 lg:p-10 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  required
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your complete address"
                required
                className="h-12"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="booth">Booth Number *</Label>
                <Select value={formData.boothNumber} onValueChange={(value) => handleSelectChange("boothNumber", value)} required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select booth number" />
                  </SelectTrigger>
                  <SelectContent>
                    {boothNumbers.map((booth) => (
                      <SelectItem key={booth.value} value={booth.value}>
                        {booth.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Complaint Category *</Label>
                <Select value={formData.complaintCategory} onValueChange={(value) => handleSelectChange("complaintCategory", value)} required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label} ({cat.labelMr})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaintDescription">Complaint Description *</Label>
              <Textarea
                id="complaintDescription"
                value={formData.complaintDescription}
                onChange={handleInputChange}
                placeholder="Describe your issue in detail..."
                required
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Upload Photo (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/50 transition-colors cursor-pointer" onClick={() => document.getElementById('imageUpload')?.click()}>
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {imageFile ? imageFile.name : "Drag and drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG up to 5MB
                </p>
                <input id="imageUpload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location (Optional)</Label>
              <Button type="button" variant="outline" className="w-full h-12 gap-2" onClick={handleGetLocation}>
                <MapPin className="h-4 w-4" />
                {location ? "Location Captured ✓" : "Share Current Location"}
              </Button>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="accent"
                size="xl"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  "Submit Complaint"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-accent" />
            </div>
            <DialogTitle className="text-center text-xl">Verify Your Identity</DialogTitle>
            <DialogDescription className="text-center">
              तुमची ओळख सत्यापित करा। We've sent a 6-digit code to <span className="font-bold text-foreground">+91 {formData.mobileNumber}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => setOtpValue(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowOTPModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleVerifyOTP}
              disabled={isVerifying || otpValue.length < 6}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Verifying...
                </>
              ) : (
                "Verify & Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Grievance;
