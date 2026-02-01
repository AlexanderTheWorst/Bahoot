import type {ComponentChildren} from "preact";
import GameSessionWrapper from "@/wrappers/GameSessionWrapper.tsx";

export default function({ children }: { children: ComponentChildren }) {
    return <>
        <GameSessionWrapper>
            {children}
        </GameSessionWrapper>
    </>
}