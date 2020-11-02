import styled from 'styled-components'
import PropTypes from 'prop-types'

export const Title = styled.h1(({ center }) => `
  margin: 1rem 0;
  text-transform: uppercase;
  text-align: left;
  ${ center ? 'text-align: center': undefined }
`)

export const Heading = styled.h2(({ center }) => `
  margin: 1rem 0;
  text-transform: uppercase;
  text-align: left;
  ${ center ? 'text-align: center': undefined };
`)

export const Subheading = styled.h3(({ center }) => `
  margin: 1rem 0;
  text-transform: uppercase;
  text-align: left;
  ${ center ? 'text-align: center': undefined }
`)

export const Paragraph = styled.p(({ align, width, maxWidth, dense }) => `
  text-align: ${ align };
  width: ${ width };
  max-width: ${ maxWidth };
  margin: ${ dense ? '0.5rem' : '1rem' } auto ${ dense ? '1rem' : '2rem' } auto;
`)

Paragraph.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  width: PropTypes.string.isRequired,
  maxWidth: PropTypes.string.isRequired,
}

Paragraph.defaultProps = {
  align: 'left',
  width: '100%',
  maxWidth: '100%',
}