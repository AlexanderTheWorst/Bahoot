import { type ComponentProps } from "preact/compat";

export default function({ className, color }: ComponentProps<"div"> & { color?: string; }) {
    return <div style={{
        borderColor: color ?? "black",
    }} className={(className ?? "") + " w-[48px] h-[48px] border-[4px] border-black border-b-transparent! rounded-full animate-spin"}>

    </div>
}