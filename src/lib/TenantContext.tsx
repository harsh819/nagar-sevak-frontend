import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

interface OfficeData {
    _id: string;
    officeName: string;
    nagarSevakName: string;
    themeColor: string;
    logo?: string;
    profilePic?: string;
    wardName?: string;
    phoneNumber?: string;
    email?: string;
    isActive: boolean;
}

interface TenantContextType {
    office: OfficeData | null;
    tenantId: string | null;
    loading: boolean;
    error: string | null;
}

const TenantContext = createContext<TenantContextType>({
    office: null,
    tenantId: null,
    loading: true,
    error: null,
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [office, setOffice] = useState<OfficeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const fetchBranding = async () => {
            const baseUrl = import.meta.env.VITE_BACKEND_URL;
            const setupCode = import.meta.env.VITE_SETUP_CODE;
            let slug = import.meta.env.VITE_OFFICE_SLUG;

            // Step 1: Check for 6-digit Setup Code (Highest Priority for dev seeding)
            if (setupCode && setupCode.length === 6) {
                try {
                    const response = await axios.get(`${baseUrl}/api/public/verify-setup/${setupCode}`);
                    if (response.data.success) {
                        const data = response.data.data;
                        setOffice(data);
                        if (data.nagarSevakName) {
                            document.title = `${data.nagarSevakName} | ${data.wardName || 'Nagar Sevak Office'}`;
                        }
                        setLoading(false);
                        return; // Successfully seeded via code
                    }
                } catch (err: any) {
                    console.error("Setup Code Verification Failed:", err);
                    setError(err.response?.data?.message || 'Invalid Setup Code');
                    setLoading(false);
                    return;
                }
            }

            // Step 2: URL path /office/:slug (Used for multi-tenant browsing)
            if (!slug) {
                const pathParts = location.pathname.split('/');
                slug = pathParts[1] === 'office' ? pathParts[2] : null;
            }

            // Step 3: Fetch by Slug if code wasn't used
            if (slug) {
                try {
                    const response = await axios.get(`${baseUrl}/api/public/office/${slug}`);
                    if (response.data.success) {
                        const data = response.data.data;
                        setOffice(data);
                        if (data.nagarSevakName) {
                            document.title = `${data.nagarSevakName} | ${data.wardName || 'Nagar Sevak Office'}`;
                        }
                    }
                } catch (err: any) {
                    setError(err.response?.data?.message || 'Office not found');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchBranding();
    }, [location.pathname]);

    return (
        <TenantContext.Provider value={{ office, tenantId: office?._id || null, loading, error }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
