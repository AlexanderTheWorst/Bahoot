import {useContext, useState} from "preact/hooks";
import {type Choice, QuizContext} from "@/wrappers/QuizWrapper.tsx";
import {SessionContext, type SessionData} from "@/wrappers/GameSessionWrapper.tsx";
import {trySendChoice} from "@/lib/quiz/session-helper.ts";
import {useEffect} from "preact/compat";
import {ArrowForwardRounded, ArrowRightRounded, HomeRounded} from "@mui/icons-material";
import {useNavigate} from "react-router";

export const WithoutTopbar = true;

type EasingFn = (t: number) => number;

const Easing = {
    linear: (t: number) => t,

    easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),

    easeInOutCubic: (t: number) =>
        t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2,

    easeOutBack: (t: number) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
};

function tween({
                   from,
                   to,
                   duration,
                   easing = Easing.easeOutCubic,
                   onUpdate
               }: {
    from: number;
    to: number;
    duration: number;
    easing?: EasingFn;
    onUpdate: (v: number) => void;
}) {
    const start = performance.now();

    function frame(now: number) {
        const t = Math.min((now - start) / duration, 1);
        const easedT = easing(t);

        onUpdate(from + (to - from) * easedT);

        if (t < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

export default function () {
    const {quiz} = useContext(QuizContext)!;
    const {sessionData, SessionHelper} = useContext(SessionContext)!;

    const [questionIndex, setQuestionIndex] = useState(0);
    const [unsavedSessionData, setUnsavedSessionData] = useState<SessionData | null>(null);
    const [answerActionResponse, setAnswerActionResponse] = useState<{
        answered: string;
        correct: Choice[]
    } | null>(null);
    const [awaitingAnswer, setAwaitingAnswer] = useState(false);

    const navigate = useNavigate();

    if (!quiz || !quiz.questions || !sessionData) return;

    const [correctPercentage, setCorrectPercentage] = useState(0);

    useEffect(() => {
        if (!sessionData) return;
        setUnsavedSessionData(null);

        if (sessionData.question !== questionIndex) {
            setAwaitingAnswer(false);
            setAnswerActionResponse(null);
        }

        setQuestionIndex(sessionData.question);

        if (sessionData.correctPercentage) {
            tween({
                from: 0,
                to: sessionData.correctPercentage * 100,
                duration: 700,
                easing: Easing.easeOutCubic,
                onUpdate: setCorrectPercentage
            });
        }
    }, [sessionData]);

    const {finished} = sessionData;

    const question = quiz.questions[sessionData.question];

    const answered = !awaitingAnswer && answerActionResponse;

    return <div className={"items-center font-dm-sans! w-screen h-screen py-[20px] px-[20px] flex flex-col"}>
        <div className={"h-[20px] w-screen fixed top-0 left-0 bg-dark-primary z-0 z-[100]"}></div>

        <div
            className={"sticky w-full z-[100] top-[20px] bg-dark-primary text-[22px] border-b border-dark-border-primary flex justify-center items-center"}>
            <div className={"pb-[20px] w-screen max-w-[1000px] flex justify-between"}>
                <p>{quiz?.name}</p>

                <p>{finished ? quiz.questions.length : questionIndex + 1} / {quiz.questions.length}</p>
            </div>
        </div>

        <div className={"py-[100px] max-w-[450px] gap-[40px] flex-1 w-full items-center justify-center flex flex-col"}>
            {finished
                ?
                <>
                    <div
                        className="flex items-center justify-center"
                        style={{
                            "--color": `hsl(${correctPercentage * 1.2}, 85%, 55%)`,
                            "--value": `${correctPercentage}%`,
                        }}
                    >
                        <div className={"relative p-[10px] w-[200px] h-[200px]"}>
                            <div className={"rounded-full z-0 absolute w-full h-full top-1/2 left-1/2 -translate-1/2"}
                                 style={{
                                     background: `conic-gradient(var(--color) var(--value), rgba(0 0 0 / 20%) var(--value))`,
                                 }}></div>

                            <div
                                className={"flex items-center justify-center rounded-full relative h-full w-full bg-dark-primary font-dm-sans text-[40px] font-bold text-[var(--color)]"}>
                                <p>{correctPercentage.toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`cursor-pointer relative w-fit h-fit flex gap-[15px] font-medium text-[20px] flex items-center justify-center gap-[12px] rounded-[10px] px-[20px] py-[12px] bg-dark-accent-primary hover:bg-dark-accent-secondary`}
                        onClick={() => navigate("/quizes")}
                    >
                        <HomeRounded/>
                        <p>Home</p>
                    </div>
                </>
                :
                <>
                    <div className={"w-full flex flex-col gap-[4px]"}>
                        <p className={"text-[22px] font-medium"}>{question.question}</p>
                        <p className={"text-white/80 text-[18px]"}>{question.description}</p>
                    </div>

                    <div className={"w-full flex-col gap-[20px] flex items-center justify-center"}>
                        {question.choices.map(choice =>
                            <div
                                className={`
                                    ${answered && answerActionResponse.correct.find(c => c.id == choice.id) ?
                                    (answerActionResponse?.answered == choice.id ? "bg-green-500/20 border-solid border-green-500" : "bg-green-500/5 border-solid border-green-500/50") :
                                    (answerActionResponse?.answered == choice.id ? "bg-red-500/10 border-solid border-red-500" : "")
                                }
                                    flex flex-col gap-[4px]
                                    w-full flex flex-col gap-[20px] border border-dashed p-[20px] rounded-[10px] border-dark-border-primary cursor-pointer
                                `}
                                onClick={() => {
                                    if (answered) return;

                                    setAwaitingAnswer(true);

                                    trySendChoice(quiz.id, sessionData?.sessionId, choice.id).then(response => {
                                        if (!response) return;

                                        const {action_response, session_data} = response as {
                                            action_response: { answered: string; correct: Choice[] },
                                            session_data: SessionData
                                        }

                                        setAwaitingAnswer(false);
                                        setAnswerActionResponse(action_response);
                                        setUnsavedSessionData(session_data);
                                    });
                                }}
                            >
                                <div className={"flex flex-col gap-[2px]"}>
                                    <p className={"text-[18px]"}>{choice.choice}</p>

                                    {answered && answerActionResponse?.correct.find(c => c.id == choice.id) && answerActionResponse?.answered == choice.id ?
                                        <p className={"text-[16px]"}>{choice.explanation}</p> : null
                                    }
                                </div>
                            </div>
                        )}
                    </div>

                    {answered ? <div>
                        <div
                            className={`cursor-pointer relative w-fit h-fit flex gap-[15px] font-medium text-[20px] flex items-center justify-center gap-[12px] rounded-[10px] px-[20px] py-[12px] bg-dark-accent-primary hover:bg-dark-accent-secondary`}
                            onClick={() => {
                                if (answered && unsavedSessionData) {
                                    SessionHelper.current.setSessionData(sessionData?.sessionId, unsavedSessionData);
                                }
                            }}
                        >
                            <p>Next</p>
                            <ArrowForwardRounded />
                        </div>
                    </div> : null}
                </>
            }
        </div>
    </div>
}