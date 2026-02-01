import type {ComponentChildren} from "preact";
import {useParams} from "react-router";
import {useContext} from "preact/hooks";
import {useEffect} from "preact/compat";
import Spinner from "@/components/Loaders/Spinner.tsx";
import {SessionContext} from "@/wrappers/GameSessionWrapper.tsx";

export default function ({children}: { children: ComponentChildren }) {
    const { quizId, sessionId } = useParams();

    const { SessionHelper, sessionData } = useContext(SessionContext)!;

    useEffect(() => {
        if (!quizId || !sessionId) return;
        SessionHelper.current.getSessionData(quizId, sessionId);
    }, [quizId]);

    return <>
        {!sessionData ?
            <Spinner color={"white"} className={"absolute top-1/2 left-1/2 -translate-1/2"} />
            :
            children
        }
    </>
}