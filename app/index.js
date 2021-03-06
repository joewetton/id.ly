/**
 * Create Main Page
 * by id.ly Team
 */

//Import Libraries
import React, { Component } from 'react';
import { View, AsyncStorage, BackHandler,
        Platform, Linking } from 'react-native';
import { Router, Scene,
        ActionConst, Actions } from 'react-native-router-flux';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import RNFetchBlob from 'react-native-fetch-blob';
import SInfo from 'react-native-sensitive-info';
import AesCrypto from 'react-native-aes-kit';

//Component Imports
import Splash from './components/splash/index';
import Home from './components/home/index';
import Scan from './components/scan/index';
import Lockbox from './components/lockbox/index';
import CardList from './components/card_list/index';
import CardView from './components/card_view/index';
import Share from './components/share/index';
import MessageThread from './components/message_thread/index';
import CreateMessage from './components/create_message/index';
import Inbox from './components/inbox/index';
import Login from './components/login/index';
import CreateCard from './components/create_card/index';
import Register from './components/register/index'
import About from './components/about/index';
//Dumby Data for Initial App Load
import CardData from './cards.json';
import MessageData from './messages.json';
import { getCards } from './actions';
import { getMessages } from './actions';
//Needed for Actions.home() back button on inbox see line 59:121
import * as ReduxActions from './actions'; //Import your actions
//Style Import
import styles from './styles';

class Main extends Component {
    constructor() {
        super();
        this.state = {key: '', iv: ''};
        this.init();
        this.getPaths = this.getPaths.bind(this);
    }

    //Create directory, files, and AES values
    init(){
        const dirs = RNFetchBlob.fs.dirs;
        paths = this.getPaths();

        RNFetchBlob.fs.mkdir(paths.dirPath)
        .catch((err) => {});

        RNFetchBlob.fs.exists(paths.cardsPath)
        .then((exist) => {
            if (exist === false){
                RNFetchBlob.fs.createFile(
                    paths.cardsPath,
                    '',
                    'utf8'
                )
                .catch((err) => {});
            }
        });

        RNFetchBlob.fs.exists(paths.messagesPath)
        .then((exist) => {
            if (exist === false){
                RNFetchBlob.fs.createFile(
                    paths.messagesPath,
                    '',
                    'utf8'
                )
                .catch((err) => {});
            }
        });

        SInfo.getItem('key', {})
        .then((value) => {
            if (value == null){
                for(var key = ''; key.length < 16;)
                    key += Math.random().toString(36).substr(2, 1)
                SInfo.setItem('key', key, {});
                this.setState({key: key});
            }
            else
                this.setState({key: value});
        });

        SInfo.getItem('iv', {})
        .then((value) => {
            if (value == null){
                for(var iv = ''; iv.length < 16;)
                    iv += Math.random().toString(36).substr(2, 1)
                SInfo.setItem('iv', iv, {});
                this.setState({iv: iv});
            }
            else
                this.setState({iv: value});
        });
    }

    getPaths(){
        const dirs = RNFetchBlob.fs.dirs;
        var dirPath = '/idly/';
        var cardsPath = '/idly/cards.dat';
        var messagesPath = '/idly/messages.dat';
        if (Platform.OS === 'ios') {
            dirPath = `${dirs.DocumentDir}${dirPath}`;
            cardsPath = `${dirs.DocumentDir}${cardsPath}`;
            messagesPath = `${dirs.DocumentDir}${messagesPath}`;
        } else {
            dirPath = dirs.DocumentDir + dirPath;
            cardsPath = dirs.DocumentDir + cardsPath;
            messagesPath = dirs.DocumentDir + messagesPath;
        }
        console.log('dirpath: ' + dirPath);
        console.log('cardspath: ' + cardsPath);
        console.log('messagespath: ' + messagesPath);
        return {dirPath: dirPath, cardsPath: cardsPath, messagesPath: messagesPath};
    }

    componentDidMount() {
        var paths = this.getPaths();
        var _this = this;
        //Check if any card data exists
        RNFetchBlob.fs.readFile(paths.cardsPath, 'utf8')
        .then((carddata) => {
            if (carddata === ''){
                AesCrypto.encrypt(JSON.stringify(CardData.card), this.state.key, this.state.iv)
                .then(cipher => {
                    RNFetchBlob.fs.writeFile(paths.cardsPath, cipher,'utf8');
                    console.log('Encrypted cards: ' + cipher)
                });
                _this.props.getCards();
            }
        });

        // check if any message data exists
        RNFetchBlob.fs.readFile(paths.messagesPath, 'utf8')
        .then((messagedata) => {
            if (messagedata === ''){
                AesCrypto.encrypt(JSON.stringify(MessageData.message), this.state.key, this.state.iv)
                .then(cipher => {
                    RNFetchBlob.fs.writeFile(paths.messagesPath, cipher,'utf8');
                    console.log('Encrypted messages: ' + cipher)
                });
                _this.props.getMessages();
            }
        });

        if (Platform.OS === 'android') {
          Linking.getInitialURL().then(url => {
            this.navigate(url);
          });
        } else {
          Linking.addEventListener('url', this.handleOpenURL);
        }

    }
    componentWillUnmount() {
        Linking.removeEventListener('url', this.handleOpenURL);
    }

    handleOpenURL = (event) => {
        this.navigate(event.url);
    }
    
    _backAndroidHandler = () => {
        const scene = Actions.currentScene;
        // alert(scene)
        if (scene === 'index' || scene === 'home' || scene === 'main') {
            BackHandler.exitApp();
            return true;
        }
        Actions.pop();
        return true;
    };

    navigate = (url) => {
        //const { navigate } = this.props.navigation;
        
        const route = url.replace(/.*?:\/\//g, '');
        let id = 'empty';
        id = route.match(/\/([^\/]+)\/?$/)[1];
        const routeName = route.split('/')[0];
        if (routeName === 'lockbox') {
          Actions.lockbox({title:"Decrypt Message", mode: "decrypt", message: id})
        };
    }


    render() {
        return (
            <Router backAndroidHandler={this._backAndroidHandler} 
                navigationBarStyle={styles.idlyColor}
                tintColor='white' titleStyle={styles.textColor}
                leftButtonTextStyle={styles.subtitle}
                rightButtonTextStyle={styles.subtitle}>
                <Scene key="root">
                    <Scene key="splash" component={Splash} initial={true}/>
                    <Scene key="home" component={Home} title="Home"
                        panHandlers={null} hideNavBar type={ActionConst.RESET}
                    />
                    <Scene key="scan" component={Scan} title="Scan" />
                    <Scene key="lockbox" component={Lockbox} title="Lockbox" />
                    <Scene key="rolodex" component={CardList}title="Rolodex"
                        onRight={() => Actions.scan()}
                        rightButtonImage={require('./assets/add_person.png')}
                        rightButtonStyle={styles.rightButton} rightButtonIconStyle={styles.rightButtonIcon} />
                    <Scene key="wallet" component={CardList} title="Wallet"
                        onRight={() => Actions.create_card()}
                        rightButtonImage={require('./assets/add.png')}
                        rightButtonStyle={styles.rightButton} rightButtonIconStyle={styles.rightButtonIcon} />
                    <Scene key="card_view" component={CardView} title="CardView" />
                    <Scene key="share" component={Share} title="Share" />
                    <Scene key="message_thread" component={MessageThread} title="MessageThread" />
                    <Scene key="create_message" component={CreateMessage} title="New Message" />
                    <Scene key="inbox" component={Inbox} title="Inbox"
                        onRight={() => Actions.create_message({sender: null, recipient: null})}
                        rightButtonImage={require('./assets/msg.png')}
                        rightButtonStyle={styles.rightButton} rightButtonIconStyle={styles.rightButtonIcon} />
                    <Scene key="create_card" component={CreateCard} title="Add Information" />
                    <Scene key="login" component={Login} title="Login" />
                    <Scene key="register" component={Register} title="Register" />
                    <Scene key="about" component={About} title="About" />
                  </Scene>
            </Router>
        );
    }
};

export default connect(null, {getCards, getMessages})(Main);