import axios from "axios";
import type {SessionData} from "@/wrappers/GameSessionWrapper.tsx";

import config from "@/config";

const protocol = window.location.protocol;

export function tryStartSession(quizId: string): Promise<string | null> {
    return new Promise(async (resolve, reject) => {
        axios.post(
            `${protocol}//${config.API_URI}/quiz/${quizId}/sessions`,
            {},
            {
                withCredentials: true
            }
        ).then(({status, data}) => {
            if (status == 200) resolve(data);
            else reject(status);
        }).catch(reject);
    })
}

export function tryGetSession(quizId: string, sessionId: string): Promise<SessionData | null> {
    return new Promise(async (resolve, reject) => {
        axios.get(
            `${protocol}//${config.API_URI}/quiz/${quizId}/sessions/${sessionId}`,
            {
                withCredentials: true
            }
        ).then(({status, data}) => {
            if (status == 200) resolve(data);
            else reject(status);
        }).catch(reject);
    })
}

export function trySendChoice(quizId: string, sessionId: string, choiceId: string) {
    return new Promise(async (resolve, reject) => {
        axios.post(
            `${protocol}//${config.API_URI}/quiz/${quizId}/sessions/${sessionId}`,
            {
              action: "Answer",
              choice: choiceId
            },
            {
                withCredentials: true
            }
        ).then(({status, data}) => {
            if (status == 200) resolve(data);
            else reject(status);
        }).catch(reject);
    })
}