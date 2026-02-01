import type {ComponentChildren} from "preact";
import QuizWrapper from "@/wrappers/QuizWrapper.tsx";

export default function({ children }: { children: ComponentChildren }) {
    return <>
        <QuizWrapper>
            {children}
        </QuizWrapper>
    </>
}