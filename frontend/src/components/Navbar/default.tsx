import {useContext, useRef, useState} from "preact/hooks";
import {AuthenticationContext} from "@/wrappers/AuthWrapper.tsx";
import Spinner from "@/components/Loaders/Spinner.tsx";

import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import {Children, type ComponentProps, createPortal, type ForwardedRef, forwardRef, useEffect} from "preact/compat";
import {AddRounded, EditRounded, LogoutRounded, QuestionMarkRounded} from "@mui/icons-material";
import {useNavigate} from "react-router";
import type {ComponentChildren, VNode} from "preact";
import {tryCreateQuiz} from "@/lib/quiz/quiz-helper.ts";

/*
  <div ref={dropdownAccountRef}
                               className={"text-[18px] shadow-1xl z-[99] flex flex-col w-fit max-w-screen absolute rounded-[10px] p-[10px] -bottom-[10px] translate-y-full right-0 bg-dark-secondary"}
                          >
                              <div
                                  className={"flex items-center text-nowrap flex gap-[8px] rounded-[5px] cursor-pointer hover:bg-white/5 p-[10px]"}>
                                  <div className={"w-[30px] h-[30px] flex items-center justify-center"}>
                                      <EditRounded/>
                                  </div>
                                  <p>Edit account</p>
                              </div>

                               <div className={"w-full py-[10px]"}>
                                  <div className={"w-full h-[1px] bg-dark-border-primary"}/>
                              </div>

                              <div onClick={() => AuthHelper.current.logout()}
                                   className={"flex items-center  hover:bg-red-500/25 hover:text-red-500 text-nowrap flex gap-[8px] rounded-[5px] cursor-pointer p-[10px]"}>
                                  <div className={"w-[30px] h-[30px] flex items-center justify-center"}>
                                      <LogoutRounded/>
                                  </div>
                                  <p>Logout</p>
                              </div>
                          </div>
 */

type DropdownOption = {
    seperator?: true;
    label?: string;
    icon?: VNode<any>;

    onRun?: () => void;

    className?: ComponentProps<"div">["className"];
}

function DropdownOption({seperator, label, icon, onRun, className = ""}: DropdownOption) {
    return <div>
        {seperator ?
            <div className={"bg-dark-border-primary h-[1px] w-full"}/>
            :
            <div
                onClick={() => onRun?.()}
                className={`${className} p-[10px] pr-[20px] text-[18px] cursor-pointer rounded-[5px] hover:bg-dark-border-primary flex items-center gap-[10px]`}>
                {icon ?
                    <div
                        className={"w-[30px] h-[30px] min-h-[30px] flex items-center justify-center h-full"}>{icon}</div> : null}
                <p className={"text-nowrap"}>{label}</p>
            </div>
        }
    </div>
}

const LocalizedDropdown = forwardRef((props: {
    children?: ComponentChildren,
    onRan?: () => void
}, ref: ForwardedRef<any>) => {
    return <div
        className={"bg-dark-secondary shadow-2xl absolute right-0 translate-y-full p-[10px] rounded-[10px] flex flex-col gap-[10px] -bottom-[10px]"}
        ref={ref}
    >
        {Children.map(props?.children, child => {
            const {onRun, ...rest} = (child as VNode<DropdownOption>).props;
            return <DropdownOption {...rest} onRun={() => {
                onRun?.();
                props.onRan?.();
            }}/>;
        })}
    </div>
})

export default function () {
    const {
        user,
        loading,
        AuthHelper
    } = useContext(AuthenticationContext)!;

    const [activeDropdown, setActiveDropDown] = useState<"Account" | "Create" | "Menu" | null>();

    const activeDropdownRef = useRef<HTMLDivElement>(null);

    const dropdownAccountTriggerRef = useRef<HTMLDivElement>(null);
    const dropdownCreateTriggerRef = useRef<HTMLDivElement>(null);
    const dropdownMenuTriggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
            const onClick = (ev: any) => {
                if (activeDropdownRef.current) {
                    if (activeDropdownRef.current!.contains(ev.target as HTMLDivElement)
                        || dropdownAccountTriggerRef.current!.contains(ev.target as HTMLDivElement)
                        || dropdownCreateTriggerRef.current!.contains(ev.target as HTMLDivElement)
                        || dropdownMenuTriggerRef.current!.contains(ev.target as HTMLDivElement)
                    ) {
                        return;
                    } else {
                        setActiveDropDown(null);
                    }
                }
            }

            window.addEventListener("click", onClick, {passive: false});

            return () => {
                window.removeEventListener("click", onClick);
            }
        }, []
    )

    if (!user && activeDropdownRef) {
        if (activeDropdown == "Account" || activeDropdown == "Create")
            setActiveDropDown(null);
    }

    const navigate = useNavigate();

    return <div
        className={"px-[20px] z-[101] relative z-[100] font-dm-sans w-screen py-[15px] justify-center flex items-center"}>
        <div className={"flex w-full justify-between  max-w-[1000px]"}>
            <div className={"relative gap-[15px] flex items-center justify-center"}>
                <p className={"text-[34px] font-medium"}>Bahoot</p>

                <div onClick={() => {
                    console.log("Clicked!")
                    setActiveDropDown("Menu")
                }}
                     ref={dropdownMenuTriggerRef}
                     className={"cursor-pointer font-medium text-[20px] flex items-center justify-center gap-[12px] rounded-[10px] px-[20px] py-[12px] bg-dark-secondary"}
                >
                    <p>Menu</p>
                    <ExpandLessRoundedIcon className={`${activeDropdown == "Menu" ? "rotate-0" : "rotate-180"}`}/>

                    {activeDropdown == "Menu" ? <>
                            <LocalizedDropdown ref={activeDropdownRef} onRan={() => setActiveDropDown(null)}>
                                <DropdownOption label={"Quizes"} icon={<QuestionMarkRounded/>}
                                                onRun={() => navigate("/quizes")}/>

                                {user ?
                                    <DropdownOption seperator={true}/> : null}

                                {user ? <DropdownOption label={"My Quizes"} icon={<EditRounded/>}
                                                        onRun={() => navigate("/quiz/mine")}/> : null}
                            </LocalizedDropdown>
                        </>
                        : null}
                </div>
            </div>

            <div className={"flex gap-[10px]"}>
                {/* + Create */}
                <div
                    className={`relative flex gap-[15px] font-medium h-full text-[20px] flex items-center justify-center gap-[12px] rounded-[10px] px-[20px] py-[12px] bg-dark-accent-primary hover:bg-dark-accent-secondary`}
                >
                    <div ref={dropdownCreateTriggerRef}
                         className={"w-full z-10 h-full absolute top-0 left-0 cursor-pointer"} onClick={() => {
                        if (!loading && !user) return navigate("/login");
                        setActiveDropDown("Create");
                    }}></div>

                    <AddRounded/>
                    <p>Create</p>

                    {!loading && user && activeDropdown == "Create" ?
                        <LocalizedDropdown ref={activeDropdownRef} onRan={() => setActiveDropDown(null)}>
                            <DropdownOption icon={<QuestionMarkRounded/>} label={"Quiz"}
                                            onRun={() => {
                                                tryCreateQuiz("Quiz").then(quiz => {
                                                    if (!quiz || !("id" in quiz)) return;
                                                    navigate(`/quiz/${quiz.id}/edit`);
                                                }).catch(console.error);
                                            }}/>
                        </LocalizedDropdown> : null}
                </div>

                {/* Login or Account */}
                <div
                    className={`relative flex gap-[15px] font-medium h-full text-[20px] flex items-center justify-center gap-[12px] rounded-[10px] px-[20px] py-[12px] bg-dark-secondary`}
                >
                    <div ref={dropdownAccountTriggerRef}
                         className={"w-full z-10 h-full absolute top-0 left-0 cursor-pointer"} onClick={() => {
                        if (!loading && !user) return navigate("/login");
                        setActiveDropDown("Account");
                    }}></div>

                    {loading ? <Spinner color={"white"} className={"w-[24px]! h-[24px]! border-2!"}/> :
                        (user ?
                                <>
                                    <p>{user.username}</p>
                                    <ExpandLessRoundedIcon
                                        className={`cursor-pointer z-0 ${activeDropdown == "Account" ? 'rotate-360' : 'rotate-180'}`}/>
                                </> :
                                <p>Login</p>
                        )}

                    {!loading && user && activeDropdown == "Account" ?
                        <LocalizedDropdown ref={activeDropdownRef} onRan={() => setActiveDropDown(null)}>
                            <DropdownOption label={"Edit Account"} icon={<EditRounded/>}
                                            onRun={() => alert("sigma")}/>
                            <DropdownOption seperator={true}/>
                            <DropdownOption className={"hover:bg-red-500/25 hover:text-red-500"} label={"Logout"}
                                            icon={<LogoutRounded/>} onRun={() => AuthHelper.current.logout()}/>
                        </LocalizedDropdown>
                        : null
                    }
                </div>
            </div>
        </div>

        {createPortal(
            <div
                className={`fixed inset-0 bg-dark-primary transition-opacity duration-100
                  ${activeDropdown ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
            />,
            document.querySelector("#app")!
        )}
    </div>
}