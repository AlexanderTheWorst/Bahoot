import {type ComponentChildren, createContext} from "preact";
import {type MutableRef, useRef, useState} from "preact/hooks";
import {tryGetSession} from "@/lib/quiz/session-helper.ts";

type SessionHelper = {
    getSessionData: (quizId: string, sessionId: string) => void;
    setSessionData: (sessionId: string, sessionData: SessionData) => void;

    sessionData?: SessionData | null;
}

type SessionContext = {
    SessionHelper: MutableRef<SessionHelper>;

    sessionData?: SessionData | null;
}

export type SessionData = {
    userId: string;
    quizId: string;
    question: number;
    answers: number[];
    sessionId: string;

    finished: boolean;
    correctPercentage?: number;
}

export const SessionContext = createContext<SessionContext | null>(null);

export default function ({children}: { children: ComponentChildren }) {
    const [sessionData, setSessionData] = useState<SessionData | null>(null);

    const sessionHelper = useRef<SessionHelper>({
        getSessionData: (quizId: string, sessionId: string) => {
            tryGetSession(quizId, sessionId).then((sessionData) => {
                if (!sessionData) return null;
                setSessionData({...sessionData, sessionId});
            })
        },

        setSessionData: (sessionId, sessionData) => {
            setSessionData({...sessionData, sessionId});
        }
    });

    return <SessionContext.Provider
        value={{SessionHelper: sessionHelper, sessionData}}>{children}</SessionContext.Provider>;
}