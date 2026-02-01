import {type ComponentChildren, createContext} from "preact";
import {type MutableRef, useRef, useState} from "preact/hooks";
import {useEffect} from "preact/compat";
import {userInfo} from "@/lib/auth/user-helper.ts";

type User = {
    id: string;
    username: string;
}

type AuthHelperType = {
    logout: () => void;
}

export const AuthenticationContext = createContext<{
    user?: User | null;
    loading: boolean;

    AuthHelper: MutableRef<AuthHelperType>;
} | null>(null);

export default function ({children}: { children: ComponentChildren }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const AuthHelper = useRef<AuthHelperType>({
        logout: () => {
            window.location.replace("http://api.bahoot.local/auth/logout");
            /*
            * logout().then(() => {
                setUser(null);
            });*/
        },
    });

    useEffect(() => {
        (async () => {
            userInfo().then(user => {
                setUser(user);
                setLoading(false);
            }).catch(() => {
                setLoading(false)
            });
        })();
    }, [])

    return <AuthenticationContext.Provider value={{
        user,
        loading,

        AuthHelper
    }}>
        {children}
    </AuthenticationContext.Provider>
}