import {useContext, useRef, useState} from "preact/hooks";
import {QuizContext} from "@/wrappers/QuizWrapper.tsx";
import {AddRounded, DeleteRounded, EditRounded, TouchAppRounded} from "@mui/icons-material";
import {type ComponentProps, type ForwardedRef, forwardRef, useEffect} from "preact/compat";

const EditableArea = forwardRef((
    {
        text,
        editing = false,
        onPointerDown,
        className = ""
    }: {
        text: string,
        className?: ComponentProps<"div">["className"],
        editing: boolean,
        onPointerDown?: (event: PointerEvent) => void
    },
    ref: ForwardedRef<any>
) => {
    if (editing) return <textarea ref={ref} value={text}
                                  className={className + " wrap-anywhere block resize-none outline-0 border-dashed border border-dark-accent-primary field-sizing-content w-fit wrap-anywhere"}/>

    return <div
        onPointerDown={onPointerDown}
        className={className + " w-fit wrap-anywhere border border-transparent group duration-300 transition-all flex gap-[10px] items-top cursor-pointer select-none"}
    >
        <p>{text}</p>
        <EditRounded className={"text-white group-hover:opacity-100 opacity-0"}/>
    </div>
})

type EditActionDescriptorChoice = {
    type: "Choice";
    id: string;
    editing: "choice" | "explanation";
}

type EditActionDescriptorQuestion = {
    type: "Question";
    id: string;
    editing: "question" | "description";
}

type EditActionDescriptorQuiz = {
    type: "Quiz";
    editing: "name" | "description";
}

export default function () {
    const {quiz, QuizHelper} = useContext(QuizContext)!

    console.log(quiz);

    const [activeQuestion, setActiveQuestion] = useState<string>("");
    const [activeChoice, setActiveChoice] = useState<string>("");

    const [editingChoiceLabel, setEditingChoiceLabel] = useState<string | null>(null);
    const [editingChoiceExplanation, setEditingChoiceExplanation] = useState<string | null>(null);
    const [editingQuizName, setEditingQuizName] = useState(false);

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const findParentIdOfChoice = (choiceId: string) => {
        return quiz?.questions?.find(q => q.choices.find(c => c.id == choiceId))?.id;
    }

    const [editActionDescriptor, setEditActionDescriptor] = useState<EditActionDescriptorChoice | EditActionDescriptorQuestion | EditActionDescriptorQuiz | null>(null)

    useEffect(() => {
        const input = inputRef.current;

        if (!input || !editActionDescriptor) return;

        input.focus();

        const onBlur = (ev: Event) => {
            const update = {
                [editActionDescriptor.editing]: input.value,
            }

            if (editActionDescriptor.type == "Choice") {
                const question = findParentIdOfChoice(editActionDescriptor?.id);
                if (!question) return;

                QuizHelper.current.updateChoice(
                    question,
                    editActionDescriptor.id,
                    update
                )
            } else if (editActionDescriptor.type == "Quiz") {
                QuizHelper.current.updateQuiz(
                    update
                )
            } else if (editActionDescriptor.type == "Question") {
                QuizHelper.current.updateQuestion(
                    editActionDescriptor.id,
                    update
                )
            }

            setEditActionDescriptor(null);
        }

        const onKeydown = (ev: KeyboardEvent) => {
            if (ev.key === "Enter") {
                return input.blur();
            }


            if (ev.key == "Escape") setEditActionDescriptor(null);
        }

        input.addEventListener("keydown", onKeydown);
        input.addEventListener("blur", onBlur);

        return () => {
            input.removeEventListener("keydown", onKeydown);
            input.removeEventListener("blur", onBlur);
        }
    }, [editActionDescriptor]);

    useEffect(() => {
        const input = inputRef.current;

        if (!input || (!editingChoiceLabel && !editingChoiceExplanation && !editingQuizName)) return;

        input.focus();

        const onBlur = (e: Event) => {
            e.stopPropagation();

            if (editingQuizName) {
                QuizHelper.current.updateQuiz({
                    name: input.value,
                });

                setEditingQuizName(false);
            }

            if (editingChoiceExplanation) {
                const questionId = findParentIdOfChoice(editingChoiceExplanation);
                if (!questionId) return;

                QuizHelper.current.updateChoice(questionId, editingChoiceExplanation, {
                    explanation: input.value,
                });

                setEditingChoiceExplanation(null);
            }

            if (editingChoiceLabel) {
                const questionId = findParentIdOfChoice(editingChoiceLabel);
                if (!questionId) return;

                QuizHelper.current.updateChoice(questionId, editingChoiceLabel, {
                    choice: input.value,
                });

                setEditingChoiceLabel(null);
            }
        }

        const onKeydown = (e: KeyboardEvent) => {
            if (e.key !== "Enter") return;

            e.preventDefault();
            input.blur();
        }

        input.addEventListener("blur", onBlur);
        // @ts-ignore
        input.addEventListener("keydown", onKeydown);

        return () => {
            input.removeEventListener("blur", onBlur);
            // @ts-ignore
            input.removeEventListener("keydown", onKeydown);
        }
    }, [editingChoiceLabel, editingChoiceExplanation, editingQuizName]);

    // We let the parent +hook.tsx load into Context

    return <div className={"font-dm-sans! px-[20px]"}>
        <div className={"h-[20px] w-screen fixed top-0 left-0 bg-dark-primary z-0 z-[100]"}></div>

        {/* Quiz name + edit */}
        <div
            className={"sticky z-[100] top-[20px] bg-dark-primary text-[22px] border-b border-dark-border-primary flex justify-center items-center"}>
            <div className={"pb-[20px] w-screen max-w-[1000px] flex justify-between"}>
                <div className={"h-fit w-fit"}>
                    {/* Pencil + name */}
                    <EditableArea ref={inputRef}
                                  editing={editActionDescriptor?.type == "Quiz" && editActionDescriptor.editing == "name"}
                                  text={quiz?.name ?? ""} onPointerDown={() => setEditActionDescriptor({
                        type: "Quiz",
                        editing: "name"
                    })}/>
                    {/*editingQuizName ? <textarea
                            className={"block resize-none text-[22px] outline-0 border-dashed border border-dark-accent-primary field-sizing-content w-fit wrap-anywhere"}
                            value={quiz?.name} ref={inputRef}/>
                        :
                        <div
                            onPointerDown={() => setEditingQuizName(true)}
                            className={"border border-transparent group duration-300 transition-all flex gap-[10px] items-center cursor-pointer select-none"}>
                            <p>{quiz?.name}</p>
                            <EditRounded className={"group-hover:opacity-100 duration-300 transition-all opacity-0"}/>
                        </div>*/}
                </div>
            </div>
        </div>

        <div className={"h-fit flex justify-center flex gap-[50px] py-[50px]"}>
            <div className={"flex flex-col w-screen max-w-[550px] gap-[50px]"}>
                {quiz?.questions?.map((question, index) =>
                    <div
                        onClick={() => {
                            setActiveQuestion(question.id);

                            if (!question.choices.find(c => c.id == activeQuestion)) {
                                console.log("Sigma")
                                setActiveChoice("");
                            }
                        }}
                        className={`
                            ${question.id == activeQuestion ? (activeChoice ? "bg-dark-secondary/10 border-solid!" : "bg-dark-secondary/15 border-solid!") : "bg-transparent"}
                             cursor-pointer p-[20px] border-dark-border-primary flex flex-col gap-[20px] w-full border border-dashed rounded-[10px]`}
                    >
                        <p>{index}.</p>
                        <div className={"flex flex-col gap-[20px]"}>
                            <div className={"text-[22px]"}>
                                <EditableArea
                                    editing={editActionDescriptor?.type == "Question" && editActionDescriptor?.id == question.id && editActionDescriptor.editing == "question"}
                                    onPointerDown={() => setEditActionDescriptor({
                                        type: "Question",
                                        id: question.id,
                                        editing: "question",
                                    })}
                                    text={question.question} ref={inputRef}/>

                                <EditableArea
                                    className={"text-[18px] text-white/80"}
                                    editing={editActionDescriptor?.type == "Question" && editActionDescriptor?.id == question.id && editActionDescriptor.editing == "description"}
                                    onPointerDown={() => setEditActionDescriptor({
                                        type: "Question",
                                        id: question.id,
                                        editing: "description",
                                    })} text={question.description} ref={inputRef}/>
                            </div>


                            <div className={"gap-[20px] flex flex-col"}>
                                {question.choices.map(choice =>
                                    <div
                                        onClick={(ev) => {
                                            setActiveQuestion(question.id)
                                            setActiveChoice(choice.id);
                                            ev.stopPropagation();
                                        }}
                                        className={`
                                            ${activeChoice == choice.id ? "bg-dark-secondary/25 border-solid!" : "bg-transparent"}
                                            flex flex-col gap-[20px] border border-dashed p-[20px] rounded-[10px] border-dark-border-primary`}
                                    >
                                        <div className={"select-none w-fit flex items-center gap-[10px] group"} onClick={() =>
                                            QuizHelper.current.updateChoice(question.id, choice.id, {
                                                correct: !choice.correct
                                            })
                                        }>
                                            <div
                                                className={`${choice.correct ? 'border-solid border-green-400 bg-green-400/10' : 'border-dashed border-dark-border-primary'} border p-[5px] px-[15px] rounded-full w-fit h-fit`}>
                                                {choice.correct ? "Correct" : "Incorrect"}
                                            </div>
                                            <TouchAppRounded className={"group-hover:opacity-100 opacity-0"}/>
                                        </div>

                                        <div className={"flex flex-col gap-[2px]"}>
                                            <EditableArea
                                                editing={editActionDescriptor?.type == "Choice" && editActionDescriptor.id == choice.id && editActionDescriptor.editing == "choice"}
                                                text={choice.choice} ref={inputRef}
                                                className={"text-[18px]"}
                                                onPointerDown={() => setEditActionDescriptor({
                                                    type: "Choice",
                                                    id: choice.id,
                                                    editing: "choice",
                                                })}/>

                                            <EditableArea
                                                className={"text-[16px] text-white/80"}
                                                editing={editActionDescriptor?.type == "Choice" && editActionDescriptor.id == choice.id && editActionDescriptor.editing == "explanation"}
                                                text={choice.explanation} ref={inputRef}
                                                onPointerDown={() => setEditActionDescriptor({
                                                    type: "Choice",
                                                    id: choice.id,
                                                    editing: "explanation",
                                                })}/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={"sticky top-[120px] w-[200px] h-fit gap-[15px] flex flex-col"}>
                {/* Base Options */}
                <div className={"text-[20px]"}>
                    {/* Add Question */}
                    <div onClick={() => QuizHelper.current.createQuestion()}
                         className={"flex items-center gap-[10px] select-none cursor-pointer hover:opacity-80 opacity-100"}>
                        <AddRounded/>
                        <p>Add Question</p>
                    </div>
                </div>

                {activeQuestion.length ?? quiz?.questions?.find(q => q.id == activeQuestion) ?
                    <>
                        <p className={"font-bold text-[color-mix(in_srgb,var(--color-dark-secondary),white_25%)]"}>QUESTION</p>

                        <div className={"text-[20px] flex flex-col gap-[15px]"}>
                            {/* Delete Question */}
                            <div onClick={() => QuizHelper.current.deleteQuestion(activeQuestion)}
                                 className={"flex items-center gap-[10px] select-none cursor-pointer hover:opacity-80 opacity-100"}>
                                <DeleteRounded/>
                                <p>Delete Question</p>
                            </div>

                            {/* Add Question */}
                            <div onClick={() => QuizHelper.current.createChoice(activeQuestion)}
                                 className={"flex items-center gap-[10px] select-none cursor-pointer hover:opacity-80 opacity-100"}>
                                <AddRounded/>
                                <p>Add Choice</p>
                            </div>
                        </div>

                        {activeChoice.length ?? quiz?.questions?.find(q => q.id == activeQuestion)!.choices?.find(c => c.id == activeChoice) ?
                            <>
                                <p className={"font-bold text-[color-mix(in_srgb,var(--color-dark-secondary),white_25%)]"}>CHOICE</p>

                                <div className={"text-[20px]"}>
                                    {/* Add Question */}
                                    <div onClick={() => QuizHelper.current.deleteChoice(findParentIdOfChoice(activeChoice)!, activeChoice)}
                                         className={"flex items-center gap-[10px] select-none cursor-pointer hover:opacity-80 opacity-100"}>
                                        <DeleteRounded/>
                                        <p>Delete Choice</p>
                                    </div>
                                </div>
                            </>
                            : null}
                    </>
                    : null}
            </div>
        </div>
    </div>
}