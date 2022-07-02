import React, { useEffect, useRef } from "react";

import axios from "axios";

import * as XLSX from "xlsx";

import { useDispatch, useSelector } from 'react-redux';
import { setItems } from "../store/slices/itemSlice"
import { db } from "../utils/firebaseConfig";
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

import {
  Button, Heading, Flex, Text, 
  Input, FormControl,
  Table, Thead, Tbody, Tr, Th,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton
} from '@chakra-ui/react';

import Item from "../components/Item";

function ItemsTable() {

  const ctx = useSelector((state) => state.item);
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const name = useRef();
  const category = useRef();
  const sellingPrice = useRef();
  const costPrice = useRef();
  const barcode = useRef();
  const stockRemaining = useRef();

  // Airtable APIs
  // Airtable Get All Items
  const getItemsAirtable = async () => {
    axios.get("http://localhost:8000/view", { crossdomain: true }).then(response => {
      const items = response.data.records.map(item => {
        return {
          ID: item.id,
          NAME: item.fields.NAME,
          CATEGORY: item.fields.CATEGORY,
          SELLING_PRICE: item.fields.SELLING_PRICE,
          COST_PRICE: item.fields.COST_PRICE,
          BARCODE: item.fields.BARCODE,
          STOCK_REMAINING: item.fields.STOCK_REMAINING
        }
      }
      );
      dispatch(setItems(items));
    });
  }

  useEffect(() => {
    getItemsAirtable();
  }, []);

  // Airtable Add
  const addItemAirtable = async (newItem) => {
    axios.post("http://localhost:8000/add", newItem, { crossdomain: true, "Content-Type": "application/json" }).then(response => {
      getItemsAirtable();
    }).catch(error => {
      console.log(error);
    })
  }

  // Airtable Update
  const updateItemAirtable = async (id, updatedItem) => {
    axios.post("http://localhost:8000/update", { id: id, updatedItem: updatedItem }, { crossdomain: true }).then(response => {
      console.log('Update Successful');
    }).catch(error => {
      console.log(error);
    })
  }

  // Airtable Delete
  const deleteItemAirtable = async (id) => {
    axios.post("http://localhost:8000/delete", { id: id }, { crossdomain: true }).then(response => {
      console.log('Delete Successful');
    }).catch(error => {
      console.log(error);
    })
  }

  // Firestore APIs
  // Firestore Get All Items
  const getItemsFirestore = async () => {
    const data = await getDocs(collection(db, "item"));
    dispatch(setItems(data.docs.map((doc) => doc.data())));
  };

  // Firestore Add
  const addItemFirestore = async (id, newItem) => {
    const itemDoc = doc(db, "item", id);
    await setDoc(itemDoc, newItem);
  };

  // Firestore Update
  const updateItemFirestore = async (id, updatedItem) => {
    const itemDoc = doc(db, "item", id);
    await updateDoc(itemDoc, updatedItem);
  };

  // Firestore Delete
  const deleteItemFirestore = async (id) => {
    const itemDoc = doc(db, "item", id);
    await deleteDoc(itemDoc);
  };

  // Add Item Handler
  const addItemHandler = () => {
    let newItem = {
      NAME: name.current.value,
      CATEGORY: category.current.value,
      SELLING_PRICE: Number(sellingPrice.current.value),
      COST_PRICE: Number(costPrice.current.value),
      BARCODE: Number(barcode.current.value),
      STOCK_REMAINING: Number(stockRemaining.current.value)
    }

    // check if item already exists using NAME
    const item = ctx.items.find(item => item.NAME === newItem.NAME);
    if (item===undefined) {
      addItemAirtable(newItem);

      let newItems = [...ctx.items, newItem];
      dispatch(setItems(newItems));
    } else {
      alert('Item already exists with same name!');
    }

    addItemFirestore(name.current.value, newItem);
    onClose();
  }

  // Update Item Handler
  const updateItemHandler = (id, updatedItem) => {
    updateItemFirestore(id, updatedItem);
    updateItemAirtable(updatedItem.ID, updatedItem);
    let newItems = ctx.items.map((item) => {
      if (item.NAME === id) {
        return updatedItem;
      }
      return item;
    });
    dispatch(setItems(newItems));
    onClose();
  }

  // Delete Item Handler
  const deleteItemHandler = (deletedItem) => {
    deleteItemFirestore(deletedItem.NAME);
    deleteItemAirtable(deletedItem.ID);
    dispatch(setItems(ctx.items.filter((item) => item.NAME !== deletedItem.NAME)));
    onClose();
  }

  // Read Excel File
  const readExcel = async (file) => {
    try {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        for (let i = 0; i < data.length; i++) {
          addItemAirtable(data[i]);
          addItemFirestore(data[i].NAME, data[i]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Flex width={'fit-content'} border='2px' mx='auto' my='20px' borderColor={'gray.500'}>
      {
        ctx.items.length === 0 ?
          <Flex width={'fit-content'} m='20px' flexDir={'column'}>
          <Text fontWeight={'bold'} mb='10px'>Upload your excel file to Airtable and Firestore!</Text>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              readExcel(file);
            }}
          />
          </Flex>
          :
          <Flex width={'auto'} flexDirection={'column'} justifyContent={'center'}>
            <Heading color={'gray.800'} mx='auto' my='10px'>Zobaze Full Stack Task</Heading>
            <Table>
              <Thead>
                {
                  ctx.items.length > 0 &&
                  <Tr>
                    <Th scope="col">NAME</Th>
                    <Th scope="col">CATEGORY</Th>
                    <Th scope="col">SELLING_PRICE</Th>
                    <Th scope="col">COST_PRICE</Th>
                    <Th scope="col">BARCODE</Th>
                    <Th scope="col">STOCK_REMAINING</Th>
                    <Th scope="col">EDIT</Th>
                    <Th scope="col">DELETE</Th>
                  </Tr>
                }
              </Thead>
              <Tbody>
                {ctx.items.map((item, index) => (
                  <Item
                    key={index}
                    index={index}
                    ID={item.ID}
                    NAME={item.NAME}
                    CATEGORY={item.CATEGORY}
                    SELLING_PRICE={item.SELLING_PRICE}
                    COST_PRICE={item.COST_PRICE}
                    BARCODE={item.BARCODE}
                    STOCK_REMAINING={item.STOCK_REMAINING}
                    updateItemHandler={updateItemHandler}
                    deleteItemHandler={() => {
                      deleteItemHandler(item);
                    }}
                  />
                ))}
              </Tbody>
            </Table>
            <Button width={'fit-content'} mx='auto' my='10px' onClick={onOpen}>Add Item</Button>

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
                      />
                      <Input
                        name='category'
                        placeholder='Category'
                        type='text'
                        mb='4px'
                        ref={category}
                      />
                      <Input
                        name='sellingPrice'
                        placeholder='Selling Price'
                        type='text'
                        mb='4px'
                        ref={sellingPrice}
                      />
                      <Input
                        name='costPrice'
                        placeholder='Cost Price'
                        type='text'
                        mb='4px'
                        ref={costPrice}
                      />
                      <Input
                        name='barcode'
                        placeholder='Barcode'
                        type='text'
                        mb='4px'
                        ref={barcode}
                      />
                      <Input
                        name='stockRemaining'
                        placeholder='Stock Remaining'
                        type='text'
                        mb='4px'
                        ref={stockRemaining}
                      />
                    </FormControl>
                  </form>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme='blue' mx='auto' onClick={addItemHandler}>
                    Add
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Flex>
      }
    </Flex>
  );
}

export default ItemsTable;