"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Toaster = () => {
    return (
        <div id="toaster" className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
            {/* Toast elements would be rendered here via a custom hook/state */}
        </div>
    );
};

export { Toaster };
