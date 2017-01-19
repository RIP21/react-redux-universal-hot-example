import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { bindActionCreators } from 'redux';
import BlogPost from '../../components/BlogPost/BlogPost';
import { sortNewPostsFirstSelector } from '../../selector/selectors';
import {StyledHome} from './HomeStyled';
import * as postsActions from '../../redux/modules/posts';
import * as authorsAction from '../../redux/modules/authors';


@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch, getState}}) => {
    const state = getState();
    if (!postsActions.isLoaded(state) && !postsActions.isLoading(state)) {
      return dispatch(postsActions.loadPosts());
    }
  }
}, {
  deferred: true,
  promise: ({store: {dispatch, getState}}) => {
    if (!authorsAction.isLoaded(getState())) {
      return dispatch(authorsAction.loadAuthors());
    }
  }
}])
class Home extends Component {

  static propTypes = {
    posts: PropTypes.array.isRequired
  };

  render() {
    // require the logo image both from client and server
    const logoImage = require('./logo.png');
    return (
      <StyledHome>
        <Helmet title="Ололось блог"/>
        <div className="masthead">
          <div className="container">
            <div className="logo">
              <p>
                <img alt="logo" src={logoImage}/>
              </p>
            </div>
            <h1>Ололось блог</h1>
            <h2>Совместный блог о путешествиях Андрея Лося aka @RIP212 и Лины Олейник</h2>
          </div>
        </div>
        <div className="container">
          {this.props.posts.map(
            post => post.published ? <BlogPost key={post.id} post={post} /> : null
          )}
        </div>
      </StyledHome>
    );
  }
}

function mapStateToProps(state) {
  return {
    posts: sortNewPostsFirstSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(postsActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
