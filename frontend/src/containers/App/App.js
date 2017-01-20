import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import Helmet from 'react-helmet';
import { LinkContainer } from 'react-router-bootstrap';
import { provideHooks } from 'redial';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import { logout, load as loadAuth } from '../../redux/modules/auth';
import { closeModal } from '../../redux/modules/error';
import { AppContent, StyledApp } from './AppStyles';

@provideHooks({
  fetch: ({dispatch}) => {
    return dispatch(loadAuth());
  }
})
class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    logout: PropTypes.func.isRequired,
    error: PropTypes.object,
    show: PropTypes.bool,
    closeModal: PropTypes.func.isRequired
  };

  onClose = () => {
    this.props.closeModal();
  };

  handleLogout = (event) => {
    event.preventDefault();
    this.props.logout();
  };

  logo = __DEVELOPMENT__ ? require('../Home/logo.png') : `http://ololos.space${require('../Home/logo.png')}`;

  appHelmet = {
    titleTemplate: '%s',
    meta: [
      {name: 'description', content: 'Совместный блог о путешествиях Андрея Лося aka @RIP212 и Лины Олейник'},
      {'http-equiv': 'Content-Language', content: 'ru'},
      {charset: 'utf-8'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:site', content: '@rip212'},
      {name: 'twitter:title', content: 'Ололось блог'},
      {name: 'twitter:description', content: 'Совместный блог о путешествиях Андрея Лося aka @RIP212 и Лины Олейник'},
      {name: 'twitter:image', content: this.logo},
      {property: 'og:url', content: 'http://ololos.space/'},
      {property: 'og:site_name', content: 'Ололось блог'},
      {property: 'og:type', content: 'website'},
      {property: 'og:image', content: this.logo},
      {property: 'og:locale', content: 'ru_RU'},
      {property: 'og:title', content: 'Ололось блог'},
      {property: 'og:description', content: 'Совместный блог о путешествиях Андрея Лося aka @RIP212 и Лины Олейник'},
      {property: 'fb:app_id', content: '966242223397117'},
    ]
  };

  render() {
    const {user, show, error} = this.props;
    return (
      <StyledApp>
        <Helmet {...this.appHelmet} />
        <ErrorModal show={show} onClose={this.onClose} error={error}/>
        <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <IndexLink to="/" activeStyle={{color: '#33e0ff'}}>
                <div className="brand"/>
                <span>Ололось блог</span>
              </IndexLink>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse >
            <Nav navbar>
              <LinkContainer to="/about">
                <NavItem >О Нас</NavItem>
              </LinkContainer>
              {user &&
              <LinkContainer to="/admin/posts">
                <NavItem >Администрирование постов</NavItem>
              </LinkContainer>}
              {user &&
              <LinkContainer to="/logout">
                <NavItem className="logout-link" onClick={this.handleLogout}>
                  Выход
                </NavItem>
              </LinkContainer>}

            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <AppContent>
          {this.props.children}
        </AppContent>

        <div className="well text-center">
          <div><a href="https://github.com/RIP21/ololos-blog-react-redux-universal">Source code</a></div>
          Made by Andrii Los aka <a href="https://twitter.com/RIP212">@RIP212</a> using nice <a
            href="https://github.com/erikras/react-redux-universal-hot-example/" target="_blank"
            rel="noopener noreferrer"
          >react-redux-universal-hot-example</a> for a base for server-side rendering.
          <div>
            Icons made by <a href="http://www.flaticon.com/authors/pixel-buddha" title="Pixel Buddha">Pixel Buddha </a>
            from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a
              href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" rel="noopener noreferrer"
              target="_blank"
            >CC 3.0 BY</a>
          </div>
        </div>
      </StyledApp>
    );
  }
}

export default connect(
  state => ({
    user: state.auth.user,
    error: state.error.error,
    show: state.error.show
  }), {closeModal, logout})(App);
