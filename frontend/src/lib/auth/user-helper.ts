import axios from "axios";

import config from "@/config.ts";

const protocol = window.location.protocol;

export function userInfo(): Promise<{
    id: string;
    username: string;
} | null> {
    return new Promise((resolve, reject) => {
        axios.get(`${protocol}//${config.API_URI}/users/@me`, {
            withCredentials: true
        }).then(({data}) => {
            console.log(data);
            if ("id" in data) {
                resolve(data);
            } else reject();
        })
    })
}

export function logout(): Promise<void> {
    return new Promise((resolve, reject) => {
        axios.get(`${protocol}//${config.API_URI}/auth/logout`, {
            withCredentials: true
        }).then(() => resolve()).catch(reject);
    });
}