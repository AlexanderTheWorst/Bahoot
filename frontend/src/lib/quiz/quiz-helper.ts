import axios from "axios";
import type {Choice, Question, Quiz} from "@/wrappers/QuizWrapper.tsx";

type QuizType = "Quiz";

import config from "@/config";

const protocol = window.location.protocol;

export function tryFetchQuizList(opts: { type?: QuizType, creator?: string }): Promise<Quiz[] | null> {
    return new Promise((resolve, reject) => {
        const type = opts.type ? `type=${opts.type}` : "";
        const creator = opts.creator ? `creator=${opts.creator}` : "";

        axios.get(`${protocol}//${config.API_URI}/quiz/all?${[type, creator].join("&")}`, {
            withCredentials: true
        }).then(({status, statusText, data}) => {
            if (status == 200) resolve(data);
            else reject(statusText);
        })
    })
}

export function tryCreateQuiz(quizType: QuizType): Promise<Quiz | null> {
    return new Promise((resolve, reject) => {
        axios.post(`${protocol}//${config.API_URI}/quiz`, {
            type: quizType
        }, {
            withCredentials: true
        }).then(({status, statusText, data}) => {
            if (status == 200) resolve(data);
            else reject(statusText);
        })
    })
}

export function tryUpdateQuiz(quizId: string, update: Quiz): Promise<{
    [key in (keyof Quiz)]: Quiz[key]
}> {
    return new Promise((resolve, reject) => {
        axios.patch(`${protocol}//${config.API_URI}/quiz/${quizId}`, update, {
            withCredentials: true
        }).then(({status, statusText, data}) => {
            if (status == 200) resolve(data);
            else reject(statusText);
        }).catch(reject);
    })
}

export function tryGetQuiz(quizId: string): Promise<Quiz | null> {
    return new Promise((resolve, reject) => {
        axios.get(`${protocol}//${config.API_URI}/quiz/${quizId}`, {
            withCredentials: true
        }).then(({status, statusText, data}) => {
            if (status == 200) resolve(data);
            else reject(statusText);
        })
    })
}

export function tryCreateQuestion(quizId: string): Promise<Question | null> {
    return new Promise((resolve, reject) => {
        axios.post(`${protocol}//${config.API_URI}/quiz/${quizId}/questions`, {}, {
            withCredentials: true
        }).then(({status, statusText, data}) => {
            if (status == 200) resolve(data);
            else reject(statusText);
        })
    })
}

export function tryUpdateQuestion(quizId: string, questionId: string, update: Question): Promise<{
    [key in (keyof Question)]: Question[key]
}> {
    return new Promise((resolve, reject) => {
        axios.patch(`${protocol}//${config.API_URI}/quiz/${quizId}/questions/${questionId}`, update, {
            withCredentials: true
        }).then(({status, statusText, data}) => {
            if (status == 200) resolve(data);
            else reject(statusText);
        }).catch(reject)
    })
}

export function tryDeleteQuestion(quizId: string, questionId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        axios.delete(`${protocol}//${config.API_URI}/quiz/${quizId}/questions/${questionId}`, {
            withCredentials: true
        }).then(({status, statusText}) => {
            if (status == 200) resolve(true);
            else reject(statusText);
        })
    })
}

export function tryCreateChoice(quizId: string, questionId: string): Promise<Choice | null> {
    return new Promise((resolve, reject) => {
        axios.post(`${protocol}//${config.API_URI}/quiz/${quizId}/questions/${questionId}/choices`, {}, {
            withCredentials: true
        }).then(({status, statusText, data}) => {
            if (status == 200) resolve(data);
            else reject(statusText);
        })
    })
}

export function tryUpdateChoice(quizId: string, questionId: string, choiceId: string, update: Choice): Promise<{
    [key in (keyof Choice)]: Choice[key]
}> {
    return new Promise((resolve, reject) => {
        axios.patch(`${protocol}//${config.API_URI}/quiz/${quizId}/questions/${questionId}/choices/${choiceId}`, update, {
            withCredentials: true
        }).then(({status, statusText, data}) => {
            if (status == 200) resolve(data);
            else reject(statusText);
        }).catch(reject)
    })
}

export function tryDeleteChoice(quizId: string, questionId: string, choiceId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        axios.delete(`${protocol}//${config.API_URI}/quiz/${quizId}/questions/${questionId}/choices/${choiceId}`, {
            withCredentials: true
        }).then(({status, statusText}) => {
            if (status == 200) resolve(true);
            else reject(statusText);
        })
    })
}