export const CARDS_AVAILABLE = 'CARDS_AVAILABLE';
export const MESSAGES_AVAILABLE = 'MESSAGES_AVAILABLE';

import {AsyncStorage} from 'react-native';

export function getCards(){
    return (dispatch) => {
        AsyncStorage.getItem('carddata', (err, cards) => {
            if (cards !== null){
                dispatch({type: CARDS_AVAILABLE, cards:JSON.parse(cards)});
            }
        });
    };
}

export function getMessages(){
    return (dispatch) => {
        AsyncStorage.getItem('messagedata', (err, messages) => {
            if (messages !== null){
                dispatch({type: MESSAGES_AVAILABLE, messages:JSON.parse(messages)});
            }
        });
    };
}
