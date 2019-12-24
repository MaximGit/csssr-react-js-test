import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
// Slomux — упрощённая, сломанная реализация Flux.
// Перед вами небольшое приложение, написанное на React + Slomux.
// Это нерабочий секундомер с настройкой интервала обновления.
// Исправьте ошибки и потенциально проблемный код, почините приложение и прокомментируйте своё решение.
// При нажатии на "старт" должен запускаться секундомер и через заданный интервал времени увеличивать свое значение на значение интервала
// При нажатии на "стоп" секундомер должен останавливаться и сбрасывать свое значение
const createStore = (reducer, initialState) => {
    let currentState = initialState;
    const listeners = [];
    const getState = () => currentState;
    const dispatch = action => {
        currentState = reducer(currentState, action);
        listeners.forEach(listener => listener())
    };
    const subscribe = listener => listeners.push(listener);
    return {getState, dispatch, subscribe}
};
const connect = (mapStateToProps, mapDispatchToProps) =>
    Component => {
        class WrappedComponent extends React.Component {
            render() {
                return (
                    <Component
                        {...this.props}
                        {...mapStateToProps(this.context.store.getState(), this.props)}
                        {...mapDispatchToProps(this.context.store.dispatch, this.props)}
                    />
                )
            }
            componentDidMount() {
                this.context.store.subscribe(this.handleChange)
            }
            handleChange = () => {
                this.forceUpdate()
            }
        }
        WrappedComponent.contextTypes = {
            store: PropTypes.object,
        };
        return WrappedComponent
    };
class Provider extends React.Component {
    getChildContext() {
        return {
            store: this.props.store,
        }
    }
    render() {
        return React.Children.only(this.props.children)
    }
}
Provider.childContextTypes = {
    store: PropTypes.object,
};
// APP
// actions
const START_TIMER = 'START_TIMER';
const STOP_TIMER = 'STOP_TIMER';
const CHANGE_INTERVAL = 'CHANGE_INTERVAL';
const startTimer = () => ({type: START_TIMER});
const stopTimer = () => ({type: STOP_TIMER});
// action creators
const changeInterval = value => ({
    type: CHANGE_INTERVAL,
    payload: value,
});
// reducers
const reducer = (state, action) => {
    switch (action.type) {
        case START_TIMER:
            return {...state, timerIsStarted: true};
        case STOP_TIMER:
            return {...state, timerIsStarted: false};
        case CHANGE_INTERVAL:
            return {
                ...state,
                currentInterval: state.currentInterval + action.payload,
            };
        default:
            return state;
    }
};
// components
class IntervalComponent extends React.Component {
    render() {
        return (
            <div>
                <span>Интервал обновления секундомера: {this.props.currentInterval} сек.</span>
                <span>
          <button onClick={() => this.props.changeInterval(-1)}>-</button>
          <button onClick={() => this.props.changeInterval(1)}>+</button>
        </span>
            </div>
        )
    }
}
const Interval = connect(dispatch => ({
        changeInterval: value => dispatch(changeInterval(value)),
    }),
    state => ({
        timerOn: state.timerOn,
        currentInterval: state.currentInterval,
    }))(IntervalComponent);
class TimerComponent extends React.Component {
    state = {
        intervalId: null,
        currentTime: 0
    };
    render() {
        return (
            <div>
                <Interval/>
                <div>
                    Секундомер: {this.state.currentTime} сек.
                </div>
                <div>
                    <button onClick={this.handleStart}>Старт</button>
                    <button onClick={this.handleStop}>Стоп</button>
                </div>
            </div>
        )
    }
    handleStart = () => {
        const intervalId = setInterval(
            () =>
                this.setState({
                    currentTime: this.state.currentTime + this.props.currentInterval,
                }),
            this.props.currentInterval * 1000,
        );
        this.setState({intervalId});
        this.props.startTimer();
    };
    handleStop = () => {
        clearInterval(this.state.intervalId);
        this.setState({intervalId: null, currentTime: 0});
        this.props.stopTimer();
    }
}
const Timer = connect(state => ({
    currentInterval: state,
}), () => {
})(TimerComponent);
// init
ReactDOM.render(
    <Provider store={createStore(reducer)}>
        <Timer/>
    </Provider>,
    document.getElementById('app')
);

