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
    loading: boolean;
    error: string | null;
}

const TenantContext = createContext<TenantContextType>({
    office: null,
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
            // Priority 1: Environment Variable (Used for dedicated production branches)
            let slug = import.meta.env.VITE_OFFICE_SLUG;

            // Priority 2: URL path /office/:slug (Used for local testing)
            if (!slug) {
                const pathParts = location.pathname.split('/');
                slug = pathParts[1] === 'office' ? pathParts[2] : null;
            }

            if (!slug) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/public/office/${slug}`);
                if (response.data.success) {
                    const data = response.data.data;
                    setOffice(data);

                    // Update document metadata
                    if (data.nagarSevakName) {
                        document.title = `${data.nagarSevakName} | ${data.wardName || 'Nagar Sevak Office'}`;
                    }
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Office not found');
            } finally {
                setLoading(false);
            }
        };

        fetchBranding();
    }, [location.pathname]);

    return (
        <TenantContext.Provider value={{ office, loading, error }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
