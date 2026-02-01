import {useEffect} from "preact/compat";
import {tryFetchQuizList} from "@/lib/quiz/quiz-helper.ts";
import {useContext, useState} from "preact/hooks";
import type {Quiz} from "@/wrappers/QuizWrapper.tsx";
import {EditRounded, PlayArrowRounded} from "@mui/icons-material";
import {tryStartSession} from "@/lib/quiz/session-helper.ts";
import {useNavigate} from "react-router";
import {AuthenticationContext} from "@/wrappers/AuthWrapper.tsx";

export default function () {
    const [quizList, setQuizList] = useState<Quiz[]>([]);

    const { user } = useContext(AuthenticationContext)!

    const navigate = useNavigate();

    useEffect(() => {
        tryFetchQuizList({}).then(quizes => {
            if (!quizes) return;
            setQuizList(quizes);
        })
    }, []);

    return <div className={"font-dm-sans w-screen flex justify-center px-[20px] pb-[20px]"}>
        <div className={"max-w-[1000px] w-full grid gap-[10px]"} style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        }}>
            {quizList.filter(q => q.creator?.id == user?.id).map((quiz) => <div
                className={"overflow-hidden flex flex-col border rounded-[10px] border-dark-border-primary bg-dark-secondary"}>
                <div className={"flex flex-col p-[20px]"}>
                    <p className={"text-[18px] font-medium"}>@{quiz?.creator?.username}</p>

                    <div className={"pt-[10px]"}>
                        <p className={"text-[20px]"}>{quiz.name}</p>
                        <p className={"text-[18px] text-white/80"}>{quiz.description}</p>
                    </div>
                </div>

                <div className={"flex-1 flex flex-col justify-end"}>
                    <div className={"px-[10px] pb-[10px]"}>
                        <p>{quiz.questions?.length} questions</p>
                    </div>

                    <div className={"flex gap-[10px] p-[10px] bg-black/10 border-t border-dark-border-primary"}>
                        <button
                            onClick={() => {
                                tryStartSession(quiz.id).then((sessionId) => {
                                    if (!sessionId) return;
                                    navigate(`/quiz/${quiz.id}/session/${sessionId}`);
                                })
                            }}
                            className={"text-[20px] font-medium hover:bg-dark-accent-secondary bg-dark-accent-primary cursor-pointer select-none flex items-center gap-[12px] rounded-[10px] px-[20px] py-[12px]"}>
                            <PlayArrowRounded className={"w-[28px] h-[28px]"}/>
                            <p>Play</p>
                        </button>

                        <button
                            onClick={() => {
                                tryStartSession(quiz.id).then((sessionId) => {
                                    if (!sessionId) return;
                                    navigate(`/quiz/${quiz.id}/edit`);
                                })
                            }}
                            className={"text-[20px] font-medium hover:bg-dark-accent-secondary/50 bg-dark-accent-primary/50 cursor-pointer select-none flex items-center gap-[12px] rounded-[10px] px-[20px] py-[12px]"}>
                            <EditRounded className={"w-[28px] h-[28px]"}/>
                            <p>Edit</p>
                        </button>
                    </div>
                </div>
            </div>)}
        </div>
    </div>
}