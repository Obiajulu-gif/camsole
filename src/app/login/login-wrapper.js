"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled can only be used in Client Components
const LoginClient = dynamic(() =>
    import ("./page-client"), {
        ssr: false,
        loading: () => ( <
            div className = "min-h-screen flex items-center justify-center" > { " " }
            Loading... { " " } <
            /div>
        ),
    });

export default function LoginWrapper() {
    return <LoginClient / > ;
}