import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { provideHooks } from "redial";
import { ErrorModal } from "../../components";
import { logout, isLoaded, load as loadAuth } from "../../redux/auth";
import { closeModal } from "../../redux/error";
import {
  Content,
  Brand,
  NavBar,
  NavContainer,
  NavLink,
  BrandLink,
  Footer,
  Container,
  Masthead,
  Logo,
  Humility
} from "./AppStyles";
const logoImage = require("./logo.png");
import "sanitize.css/sanitize.css";

@provideHooks({
  fetch: ({ dispatch, getState }) => {
    return !isLoaded(getState()) ? dispatch(loadAuth()) : null;
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

  handleLogout = event => {
    event.preventDefault();
    this.props.logout();
  };

  logo = __DEV__ ? require("./logo.png") : `http://ololos.space/${require("./logo.png")}`;

  appHelmet = {
    titleTemplate: "%s",
    meta: [
      { name: "description", content: "Совместный блог о путешествиях Андрея Лося aka @RIP212 и Лины Олейник" },
      { "http-equiv": "Content-Language", content: "ru" },
      { charset: "utf-8" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@rip212" },
      { name: "twitter:title", content: "Ололось блог" },
      { name: "twitter:description", content: "Совместный блог о путешествиях Андрея Лося aka @RIP212 и Лины Олейник" },
      { name: "twitter:image", content: this.logo },
      { property: "og:url", content: "http://ololos.space/" },
      { property: "og:site_name", content: "Ололось блог" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: this.logo },
      { property: "og:locale", content: "ru_RU" },
      { property: "og:title", content: "Ололось блог" },
      { property: "og:description", content: "Совместный блог о путешествиях Андрея Лося aka @RIP212 и Лины Олейник" },
      { property: "fb:app_id", content: "966242223397117" }
    ]
  };

  render() {
    const { user, show, error, path } = this.props;
    const isHome = path === "/";
    return (
      <div>
        <Helmet {...this.appHelmet} />
        <ErrorModal show={show} onClose={this.onClose} error={error} />
        <NavBar>
          <NavContainer>
            <BrandLink to="/" activeStyle={{ color: "#33e0ff" }}>
              <Brand />
              <span>Ололось блог</span>
            </BrandLink>
            <NavLink to="/about">
              О Нас
            </NavLink>
            {user &&
              <NavLink to="/admin/posts">
                Администрирование постов
              </NavLink>}
            {user &&
              <NavLink to="/" onClick={this.handleLogout}>
                Выход
              </NavLink>}
          </NavContainer>
        </NavBar>
        {isHome &&
          <Masthead>
            <Logo>
              <p>
                <img alt="logo" src={logoImage} />
              </p>
            </Logo>
            <h1>Ололось блог</h1>
            <h2>Совместный блог о путешествиях Андрея Лося aka @RIP212 и Лины Олейник</h2>
          </Masthead>}
        <Container>
          <Content isHome={isHome}>
            {this.props.children}
          </Content>
        </Container>
        <Footer>
          <div><a href="https://github.com/RIP21/ololos-blog-react-redux-universal">Source code</a></div>
          Made by Andrii Los aka
          {" "}
          <a href="https://twitter.com/RIP212">@RIP212</a>
          {" "}
          using nice
          {" "}
          <a
            href="https://github.com/erikras/react-redux-universal-hot-example/"
            target="_blank"
            rel="noopener noreferrer"
          >
            react-redux-universal-hot-example
          </a>
          {" "}
          for a base for server-side rendering.
          <div>
            Icons made by <a href="http://www.flaticon.com/authors/pixel-buddha" title="Pixel Buddha">Pixel Buddha </a>
            from
            {" "}
            <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a>
            {" "}
            is licensed by
            {" "}
            <a
              href="http://creativecommons.org/licenses/by/3.0/"
              title="Creative Commons BY 3.0"
              rel="noopener noreferrer"
              target="_blank"
            >
              CC 3.0 BY
            </a>
          </div>
        </Footer>
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => ({
    user: state.auth.user,
    error: state.error.error,
    show: state.error.show,
    path: ownProps.location.pathname
  }),
  { closeModal, logout }
)(App);
