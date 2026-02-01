import {type ComponentChildren, createContext} from "preact";
import {type MutableRef, useRef, useState} from "preact/hooks";
import {
    tryCreateChoice,
    tryCreateQuestion,
    tryDeleteChoice,
    tryDeleteQuestion,
    tryGetQuiz,
    tryUpdateChoice,
    tryUpdateQuestion,
    tryUpdateQuiz
} from "@/lib/quiz/quiz-helper.ts";

type ChoiceOptions = {
    [key in (keyof Choice)]?: Choice[key]
};

type QuizOptions = {
    [key in (keyof Quiz)]?: Quiz[key]
};

type QuestionOptions = {
    [key in (keyof Question)]?: Question[key]
};

type QuizHelper = {
    fetchQuizData: (quizId: string) => void;

    updateQuiz: (update: QuizOptions) => void;

    createQuestion: () => void;
    updateQuestion: (questionId: string, update: QuestionOptions) => void;
    deleteQuestion: (questionId: string) => void;

    createChoice: (questionId: string) => void;
    deleteChoice: (questionId: string, choiceId: string) => void;
    updateChoice: (questionId: string, choiceId: string, update: ChoiceOptions) => void;

    quiz?: Quiz | null;
}

export type User = {
    id: string;
    username: string;
}

export type Question = {
    id: string;
    question: string;
    description: string;
    choices: Choice[];
}

export type Choice = {
    id: string;
    choice: string;
    explanation: string;
    correct: boolean;
}

export type Quiz = {
    id: string;
    name: string;
    description: string;

    creator?: User;
    questions?: Question[];
}

type QuizContext = {
    QuizHelper: MutableRef<QuizHelper>;

    quiz: Quiz | null;
    loading: boolean;
}

export const QuizContext = createContext<QuizContext | null>(null);

export default function ({children}: { children: ComponentChildren }) {
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);

    const quizHelper = useRef<QuizHelper>({
        fetchQuizData: (quizId: string) => {
            setLoading(true);
            tryGetQuiz(quizId).then((quizData) => {
                setQuizData(quizData ?? null);
                setLoading(false)
            }).catch(console.error);
        },

        updateQuiz: (update) => {
            if (!quizHelper.current.quiz) return null;

            const original = quizHelper.current.quiz;

            // Optimistic update
            setQuizData(old => {
                if (!old) return old;
                return {
                    ...old,
                    ...update
                }
            })

            tryUpdateQuiz(quizHelper.current.quiz.id, update as Quiz).then((data) => {
                if (!data) return setQuizData(original);

                setQuizData(old => {
                    if (!old) return old;
                    return {
                        ...old,
                        ...data
                    }
                })
            }).catch((err) => {
                setQuizData(original);
                console.log(err);
            })
        },

        createQuestion: () => {
            if (!quizHelper.current.quiz) return null;

            tryCreateQuestion(quizHelper.current.quiz?.id!).then((question) => {
                if (!question) return;

                setQuizData((old) => {
                    if (!old) return old;
                    return {
                        ...old, questions: [...(old?.questions ?? []), question]
                    }
                })
            })
        },

        updateQuestion: (questionId, update) => {
            if (!quizHelper.current.quiz) return null;

            const original = quizHelper.current.quiz;

            // Optimistic update.
            setQuizData(old => {
                if (!old) return old;
                return {
                    ...old,
                    questions: old?.questions?.map(q => {
                        if (q.id !== questionId) return q;
                        return {
                            ...q,
                            ...update
                        }
                    })
                }
            })

            tryUpdateQuestion(quizHelper.current.quiz.id, questionId, update as Question).then((data) => {
                if (!data) return setQuizData(original);

                setQuizData(old => {
                    if (!old) return old;
                    return {
                        ...old,
                        questions: old?.questions?.map(q => {
                            if (q.id !== questionId) return q;
                            return {
                                ...q,
                                ...data
                            }
                        })
                    }
                })
            }).catch((err) => {
                console.log(err);
                setQuizData(original);
            })
        },

        deleteQuestion: (questionId) => {
            if (!quizHelper.current.quiz) return null;

            tryDeleteQuestion(quizHelper.current.quiz?.id!, questionId).then((success) => {
                if (!success) return;

                setQuizData((old) => {
                    if (!old) return old;
                    return {
                        ...old, questions: old.questions?.filter(q => q.id !== questionId)
                    }
                })
            })
        },

        createChoice: (questionId) => {
            if (!quizHelper.current.quiz) return null;

            tryCreateChoice(quizHelper.current.quiz?.id!, questionId).then((choice) => {
                if (!choice) return;

                setQuizData((old) => {
                    if (!old) return old;
                    return {
                        ...old, questions: old.questions?.map(question => {
                            if (question.id !== questionId) return question;
                            return {...question, choices: [...question.choices, choice]}
                        })
                    }
                })
            })
        },

        updateChoice: (questionId: string, choiceId: string, update) => {
            if (!quizHelper.current.quiz) return null;

            const original = quizHelper.current.quiz;

            // Optimistic update.
            setQuizData(old => {
                if (!old) return old;
                return {
                    ...old,
                    questions: old?.questions?.map(q => {
                        if (q.id !== questionId) return q;
                        return {
                            ...q,
                            choices: q.choices.map(c => {
                                if (c.id !== choiceId) return c;
                                return {...c, ...update}
                            })
                        }
                    })
                }
            })

            tryUpdateChoice(quizHelper.current.quiz.id, questionId, choiceId, update as Choice).then((data) => {
                if (!data) return setQuizData(original);

                setQuizData(old => {
                    if (!old) return old;
                    return {
                        ...old,
                        questions: old?.questions?.map(q => {
                            if (q.id !== questionId) return q;
                            return {
                                ...q,
                                choices: q.choices.map(c => {
                                    if (c.id !== choiceId) return c;
                                    return {...c, ...data}
                                })
                            }
                        })
                    }
                })
            }).catch((err) => {
                console.log(err);
                setQuizData(original);
            })
        },

        deleteChoice: (questionId: string, choiceId: string) => {
            if (!quizHelper.current.quiz) return null;

            tryDeleteChoice(quizHelper.current.quiz?.id!, questionId, choiceId).then((success) => {
                if (!success) return;

                setQuizData((old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        questions: old.questions?.map(q => {
                            if (q.id !== questionId) return q;
                            return {
                                ...q,
                                choices: q.choices.filter(c => c.id !== choiceId)
                            }
                        })
                    }
                })
            })
        }
    });

    quizHelper.current.quiz = quizData;

    return <QuizContext.Provider
        value={{QuizHelper: quizHelper, quiz: quizData, loading}}>{children}</QuizContext.Provider>;
}