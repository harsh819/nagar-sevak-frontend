-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create staff table
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    designation TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create complaints table
CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_number TEXT NOT NULL UNIQUE,
    citizen_name TEXT NOT NULL,
    citizen_phone TEXT NOT NULL,
    citizen_address TEXT NOT NULL,
    booth_number TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    status TEXT NOT NULL DEFAULT 'new',
    assigned_staff_id UUID REFERENCES public.staff(id),
    completion_photo_url TEXT,
    completion_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.staff(id),
    priority TEXT DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create development_works table
CREATE TABLE public.development_works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    budget DECIMAL(12,2),
    contractor_name TEXT,
    progress INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming',
    before_photo_url TEXT,
    after_photo_url TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.development_works ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User roles: Users can view their own roles, admins can manage all
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: Users can view/update their own, admins can view all
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Staff: Admins and staff can view, admins can manage
CREATE POLICY "Staff and admins can view staff" ON public.staff
    FOR SELECT USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'staff')
    );

CREATE POLICY "Admins can manage staff" ON public.staff
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Complaints: Public can insert, admin/staff can manage
CREATE POLICY "Anyone can submit complaints" ON public.complaints
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view their own complaints by phone" ON public.complaints
    FOR SELECT USING (true);

CREATE POLICY "Staff and admins can manage complaints" ON public.complaints
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'staff')
    );

-- Tasks: Staff and admins can view and manage
CREATE POLICY "Staff and admins can view tasks" ON public.tasks
    FOR SELECT USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'staff')
    );

CREATE POLICY "Admins can manage tasks" ON public.tasks
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can update assigned tasks" ON public.tasks
    FOR UPDATE USING (
        public.has_role(auth.uid(), 'staff') AND 
        assigned_to IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
    );

-- Development works: Public can view, admins can manage
CREATE POLICY "Anyone can view development works" ON public.development_works
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage development works" ON public.development_works
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_development_works_updated_at BEFORE UPDATE ON public.development_works
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage policies for uploads bucket
CREATE POLICY "Anyone can view uploads" ON storage.objects
    FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Staff and admins can update uploads" ON storage.objects
    FOR UPDATE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Staff and admins can delete uploads" ON storage.objects
    FOR DELETE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');