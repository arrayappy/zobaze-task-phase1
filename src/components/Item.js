import React, { useRef } from 'react'

import { Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, FormControl, Tr, Th } from '@chakra-ui/react';

function Item({ index, ID, NAME, CATEGORY, SELLING_PRICE, COST_PRICE, BARCODE, STOCK_REMAINING, deleteItemHandler, updateItemHandler }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const name = useRef();
  const category = useRef();
  const sellingPrice = useRef();
  const costPrice = useRef();
  const barcode = useRef();
  const stockRemaining = useRef();

  const updateItem = () => {
    const item = {
      ID: ID,
      NAME: name.current.value,
      CATEGORY: category.current.value,
      SELLING_PRICE: Number(sellingPrice.current.value),
      COST_PRICE: Number(costPrice.current.value),
      BARCODE: Number(barcode.current.value),
      STOCK_REMAINING: Number(stockRemaining.current.value)
    }
    updateItemHandler(NAME, item);
    onClose();
  }
  return (
    <Tr key={index}>
      <Th>{NAME}</Th>
      <Th>{CATEGORY}</Th>
      <Th>{SELLING_PRICE}</Th>
      <Th>{COST_PRICE}</Th>
      <Th>{BARCODE}</Th>
      <Th>{STOCK_REMAINING}</Th>
      <Th color={'blue'} onClick={onOpen}>EDIT</Th>
      <Th color={'red'} onClick={() => {
        deleteItemHandler(NAME);
      }
      }>DELETE</Th>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Item details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={onClose}>
              <FormControl>
                <Input
                  name='name'
                  placeholder='Title'
                  type='text'
                  mb='4px'
                  ref={name}
                  defaultValue={NAME}
                />
                <Input
                  name='category'
                  placeholder='Category'
                  type='text'
                  mb='4px'
                  ref={category}
                  defaultValue={CATEGORY}
                />
                <Input
                  name='sellingPrice'
                  placeholder='Selling Price'
                  type='text'
                  mb='4px'
                  ref={sellingPrice}
                  defaultValue={SELLING_PRICE}
                />
                <Input
                  name='costPrice'
                  placeholder='Cost Price'
                  type='text'
                  mb='4px'
                  ref={costPrice}
                  defaultValue={COST_PRICE}
                />
                <Input
                  name='barcode'
                  placeholder='Barcode'
                  type='text'
                  mb='4px'
                  ref={barcode}
                  defaultValue={BARCODE}
                />
                <Input
                  name='stockRemaining'
                  placeholder='Stock Remaining'
                  type='text'
                  mb='4px'
                  ref={stockRemaining}
                  defaultValue={STOCK_REMAINING}
                />
              </FormControl>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} mx='auto' onClick={updateItem}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Tr>
  )
}

export default Item;