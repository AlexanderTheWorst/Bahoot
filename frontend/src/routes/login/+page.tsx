// @ts-ignore
import Icon from "../../assets/Icon.svg?react";
import {Link, useNavigate} from "react-router";
import {useContext, useState} from "preact/hooks";
import {AuthenticationContext} from "@/wrappers/AuthWrapper.tsx";
import Spinner from "@/components/Loaders/Spinner.tsx";

import config from "@/config.ts";
import {ErrorRounded} from "@mui/icons-material";
import {useEffect} from "preact/compat";

function stringToBoolean(value: string) {
    if (value == "false") return false;
    else if (value == "true") return true;
}

export default function () {
    const { user, loading } = useContext(AuthenticationContext)!;

    const navigate = useNavigate();

    if (user && !loading) {
        navigate("/");
        return <p>Yo</p>
    };

    const protocol = window.location.protocol;

    const query = new URLSearchParams(decodeURI(window.location.search));

    const [error, setError] = useState(!query.get("error") ? false : query.get("error"))
    const [usernameHasError, setUsernameHasError] = useState(!query.get("username") ? false : !stringToBoolean(query.get("username")!));
    const [passwordHasError, setPasswordHasError] = useState(!query.get("password") ? false : !stringToBoolean(query.get("password")!));

    if (loading) return <>
        <div className={"w-screen h-screen absolute top-0 left-0 flex items-center justify-center"}>
            <Spinner color={"white"} />
        </div>
    </>

    return <>
        <div className={"font-dm-sans! absolute z-[1] top-0 left-0 w-screen h-screen flex items-center justify-center"}>
            <form method={"POST"} action={`${protocol}//${config.API_URI}/auth/login`}
                  className={"font-dm-sans! flex flex-col gap-[20px] max-w-[350px] w-screen"}>

                {error ? <div className="flex gap-[10px] rounded-[4px] p-[10px] font-dm-sans text-[16px] border border-red-500/20 bg-red-500/10 font-medium text-red-300">
                        <ErrorRounded />
                        <p>{error}</p>
                    </div>
                    : null}

                {/* Username */}
                <div className={"flex flex-col gap-[10px] text-[18px]"}>
                    <label className={"text-[18px]/[18px]"} htmlFor={"username"}>Username</label>
                    <input
                        onInput={() => setUsernameHasError(false)}
                        className={`${usernameHasError ? "border-red-500!" : ""} outline-0 border-transparent focus:border-dark-border-primary border-2 bg-dark-secondary p-[10px] rounded-[10px]`}
                        name="username" type={"text"} placeholder={"Bob"} value={query.get("usernameValue") ?? ""}/>
                </div>

                {/* Password */}
                <div className={"flex flex-col gap-[10px] text-[18px]"}>
                    <label className={"text-[18px]/[18px]"} htmlFor={"password"}>Password</label>
                    <input
                        onInput={() => setPasswordHasError(false)}
                        className={`${passwordHasError ? "border-red-500!" : ""} outline-0 border-transparent focus:border-dark-border-primary border-2 bg-dark-secondary p-[10px] rounded-[10px]`}
                        name="password" type={"password"} placeholder={"Password##1234"}/>
                </div>

                {/* Submit */}
                <button
                    className={"rounded-[10px] cursor-pointer hover:bg-dark-accent-secondary text-[18px] text-center bg-dark-accent-primary p-[10px]"}>Login
                </button>

                {/* OR */}
                <div>
                    <span>Don't have an account? <Link to={"/register"} className={"underline-offset-4 underline"}>Make one here</Link>!</span>
                </div>
            </form>
        </div>
    </>
}