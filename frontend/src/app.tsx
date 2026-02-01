import './app.css'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {useRef, useState} from "preact/hooks";
import {useEffect} from "preact/compat";
import Spinner from "@/components/Loaders/Spinner.tsx";
import AuthWrapper from "@/wrappers/AuthWrapper.tsx";
import NavbarDefault from "@/components/Navbar/default";

let pages = import.meta.glob("./routes/**/+page.tsx");
let hooks = import.meta.glob("./routes/**/+hook.tsx");

export function App() {
    const [loaded, setLoaded] = useState(false);
    const funcs = useRef(new Map<string, any>());
    const mods = useRef(new Map<string, any>());

    function getHooksForRoute(pagePath: string) {
        const segments = pagePath.split("/");
        segments.pop(); // remove +page.tsx

        const hooks: any[] = [];

        while (segments.length > 2) {
            const hookPath = [...segments, "+hook.tsx"].join("/");
            const hook = funcs.current.get(hookPath);
            if (hook) hooks.push(hook);

            segments.pop();
        }

        return hooks; // DO NOT reverse
    }

    useEffect(() => {
        (async () => {
            for (const [path, loader] of Object.entries(pages)) {
                funcs.current.set(path, (await loader() as any).default);
                mods.current.set(path, (await loader() as any));
            }

            for (const [path, loader] of Object.entries(hooks)) {
                funcs.current.set(path, (await loader() as any).default);
            }

            setLoaded(true);
        })();
    }, []);

    if (!loaded) return <div className={"bg-dark-primary w-screen h-screen flex items-center justify-center"}>
        <Spinner color={"white"} />
    </div>;

    return (
        <AuthWrapper>
            <div
                className={"overflow-x-hidden overflow-y-scroll h-screen w-screen min-h-screen bg-dark-primary text-white"}>
                {loaded ? <BrowserRouter>
                    <Routes>
                        {
                            [...funcs.current.keys()]
                                .filter(key => key.endsWith("+page.tsx"))
                                .map(key => {
                                    let segments = key.split("/");

                                    let path = segments
                                        .slice(2, -1)
                                        .map(seg => {
                                            let match = /^\[(.+)\]$/g.exec(seg);
                                            return match ? `:${match[1]}` : seg;
                                        })
                                        .join("/");

                                    path = path || "/";
                                    if (path !== "/" && !path.startsWith("/")) path = "/" + path;

                                    const PageComponent = funcs.current.get(key)!;
                                    const hooksForRoute = getHooksForRoute(key);

                                    // Wrap page inside hooks
                                    let element = <PageComponent/>;
                                    for (const Hook of hooksForRoute) {
                                        element = <Hook>{element}</Hook>;
                                    }

                                    return <Route key={path} path={path} element={<>
                                        {
                                            !mods.current.get(key)?.WithoutTopbar ?
                                                <NavbarDefault/>
                                                :
                                                null
                                        }
                                        {element}
                                    </>
                                    }/>;
                                })
                        }

                        <Route key={"*"} path={"*"} element={<><NavbarDefault/><p>Not found!</p></>}/>
                    </Routes>
                </BrowserRouter> : <div className={"bg-dark-primary w-screen h-screen flex items-center justify-center"}>
                    <Spinner color={"white"} />
                </div>}
            </div>
        </AuthWrapper>
    )
}