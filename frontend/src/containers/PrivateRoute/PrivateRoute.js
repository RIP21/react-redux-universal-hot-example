import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { redirectToLogin, saveRouteToBackRedirect } from '../../redux/modules/auth';

const mapStateToProps = (state, ownProps) => ({
  auth: state.auth,
  location: ownProps.location.pathname
});
const mapDispatchToProps = {
  redirectToLogin,
  saveRouteToBackRedirect
};

export default function privateRoute() {
  return (WrappedComponent) => {
    class AuthWrapper extends React.Component {

      static propTypes = {
        auth: PropTypes.object,
        redirectToLogin: PropTypes.func,
        saveRouteToBackRedirect: PropTypes.func,
        location: PropTypes.string
      };

      componentDidMount() {
        this.redirectIfNotLogged(this.props);
      }

      componentWillReceiveProps(nextProps) {
        this.redirectIfNotLogged(nextProps);
      }

      componentWillUnmount() {
        if (!this.props.auth.user) {
          this.props.saveRouteToBackRedirect(this.props.location);
        }
      }

      redirectIfNotLogged(props) {
        const {loading, user} = props.auth;
        if (loading === false && !user) {
          this.props.redirectToLogin();
        }
      }

      render() {
        const {loading, user} = this.props.auth;
        if (loading || !user) {
          return (
            <div className="center loader">
              <div>Loading...</div>
            </div>
          );
        }

        return <WrappedComponent {...this.props} />;
      }
    }

    if (WrappedComponent['@@redial-hooks']) {
      AuthWrapper['@@redial-hooks'] = WrappedComponent['@@redial-hooks'];
    }

    return connect(mapStateToProps, mapDispatchToProps)(AuthWrapper);
  };
}
