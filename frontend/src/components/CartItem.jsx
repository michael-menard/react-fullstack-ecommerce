import React from 'react';
import {Form, Image, ListGroup} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

const CartItem = () => {
  return (
    <>
      <ListGroup.Item>
        <Row>
          <Col md={2}>
            <Image crossOrigin={'anonymous'} src='/images/games-category.png' fluid />
          </Col>
          <Col md={2}>
            Logitech series <br/>
            Gaming Mouse
          </Col>
          <Col md={2}>
            <b>$89</b>
          </Col>
          <Col md={3}>
            <Form.Select>
              <option value='1'>1</option>
              <option value='2'>2</option>
              <option value='3'>3</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Button type={'button'} variant={'secondary'} onClick={() => window.confirm('Are you sure?')}>
              <i className={'bi bi-trash'} />
            </Button>
          </Col>
        </Row>
      </ListGroup.Item>
    </>
  );
};

export default CartItem;