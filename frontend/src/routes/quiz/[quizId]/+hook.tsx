import type {ComponentChildren} from "preact";
import {useParams} from "react-router";
import {useContext} from "preact/hooks";
import {QuizContext} from "@/wrappers/QuizWrapper.tsx";
import {useEffect} from "preact/compat";
import Spinner from "@/components/Loaders/Spinner.tsx";

export default function ({children}: { children: ComponentChildren }) {
    const { quizId } = useParams();

    const { QuizHelper, quiz, loading } = useContext(QuizContext)!;

    useEffect(() => {
        if (!quizId) return;
        QuizHelper.current.fetchQuizData(quizId);
    }, [quizId]);

    return <>
        {(!quiz || loading) ?
            <Spinner color={"white"} className={"absolute top-1/2 left-1/2 -translate-1/2"} />
        :
            children
        }
    </>
}