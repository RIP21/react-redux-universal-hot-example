import {connect} from 'react-redux';
import objectAssign from 'object-assign';
import React, {Component, PropTypes} from 'react';
import {push} from 'react-router-redux';
import {provideHooks} from 'redial';
import {getById} from '../../utils/helpers';
import {postsSelector, authorsSelector} from '../../selector/selectors';
import * as Empty from '../../constants/emptyEntities';
import EditPostForm from './EditPostForm';
import * as postsActions from '../../redux/modules/posts';
import * as authorsAction from '../../redux/modules/authors';

@provideHooks({
  fetch: ({dispatch}) => {
    return Promise.all([
      dispatch(postsActions.loadPosts()),
      dispatch(authorsAction.loadAuthors()),
    ]);
  },
})
class EditPostPage extends Component {

  static propTypes = {
    createPost: PropTypes.func.isRequired,
    updatePost: PropTypes.func.isRequired,
    post: PropTypes.object.isRequired,
    author: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
  };

  state = {
    post: objectAssign({}, this.props.post)
  };

  setPostField = (name, value) => {
    this.setState((prevState) => {
      return {post: {...prevState.post, [name]: value}};
    });
  };

  updatePostState = (event) => {
    const {checked, type, value, name} = event.target;
    const isCheckbox = type === 'checkbox';
    const valueToSet = isCheckbox ? checked : value;
    this.setPostField(name, valueToSet);
  };

  handleEditorChange = (value, field) => {
    this.setPostField(field, value);
  };

  updateOrCreate = (post) => {
    const {updatePost, createPost} = this.props;
    if (post.id) {
      return updatePost(post);
    }
    post.author = this.props.author; //eslint-disable-line
    return createPost(post);
  };

  savePost = (event) => {
    const post = this.state.post;
    event.preventDefault();
    this.updateOrCreate(post).then(() => {
      this.props.push('/admin/posts');
    });
  };

  render() {
    return (
      <div className="container">
        <EditPostForm
          post={this.state.post}
          loading={this.state.loading}
          onChange={this.updatePostState}
          handleEditorChange={this.handleEditorChange}
          onSave={this.savePost}
        />
      </div>
    );
  }
}


function mapStateToProps(state, ownProps) {
  const {userName} = state.auth.user;

  return {
    author: getById(authorsSelector(state), userName, Empty.AUTHOR),
    post: getById(postsSelector(state), ownProps.params.id, Empty.POST),
    loading: state.posts.loading
  };
}

export default connect(mapStateToProps, {...postsActions, push})(EditPostPage);
