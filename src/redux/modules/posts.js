import initialState from '../../constants/initialState';
/*eslint-disable no-underscore-dangle*/

export const LOAD_POSTS = 'posts/LOAD_ALL';
export const LOAD_POSTS_FAIL = 'posts/LOAD_ALL_FAIL';
export const LOAD_POSTS_SUCCESS = 'posts/LOAD_ALL_SUCCESS';

export const CREATE_POST = 'posts/CREATE';
export const CREATE_POST_FAIL = 'posts/CREATE_FAIL';
export const CREATE_POST_SUCCESS = 'posts/CREATE_SUCCESS';

export const UPDATE_POST = 'posts/UPDATE';
export const UPDATE_POST_FAIL = 'posts/UPDATE_FAIL';
export const UPDATE_POST_SUCCESS = 'posts/UPDATE_SUCCESS';

export const DELETE_POST = 'posts/DELETE';
export const DELETE_POST_FAIL = 'posts/DELETE_FAIL';
export const DELETE_POST_SUCCESS = 'posts/DELETE_SUCCESS';

export default function reducer(state = initialState.posts, action = {}) {
  switch (action.type) {

    case CREATE_POST:
    case DELETE_POST:
    case LOAD_POSTS:
    case UPDATE_POST:
      return {
        ...state,
        loading: true
      };

    case CREATE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        posts: [...state.posts, Object.assign({}, action.result)]
      };

    case UPDATE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        posts: [...state.posts.filter(post => post.id !== action.result.id), Object.assign({}, action.result)]
      };

    case DELETE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        posts: [...state.posts.filter(post => post.id !== action.result.id)]
      };

    case LOAD_POSTS_SUCCESS:
      return {
        ...state,
        loading: false,
        posts: action.result._embedded.posts
      };
    default:
      return state;
  }
}

export function loadPosts() {
  return {
    types: [LOAD_POSTS, LOAD_POSTS_SUCCESS, LOAD_POSTS_FAIL],
    promise: client => client.get('/posts')
  };
}

/*const getAuthorByAuthentication = (getState) => {
 return getState().authors.filter(author => author.id === getState().authentication.username)[0];
 };*/

export function createPost(post) {
  post.author = {id: 'RIP21', authorName: 'Andrii Los'}; //eslint-disable-line
  return {
    types: [CREATE_POST, CREATE_POST_SUCCESS, CREATE_POST_FAIL],
    promise: client => client.post('/posts', {data: post})
  };
}

export function updatePost(post) {
  return {
    types: [UPDATE_POST, UPDATE_POST_SUCCESS, UPDATE_POST_FAIL],
    promise: client => client.put(`/posts/${post.id}`, {data: post})
  };
}

export function deletePost(postId) {
  return {
    types: [DELETE_POST, DELETE_POST_SUCCESS, DELETE_POST_FAIL],
    promise: client => client.put(`/posts/${postId}`, {data: {}})
  };
}
