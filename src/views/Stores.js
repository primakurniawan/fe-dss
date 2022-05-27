import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import Axios from 'axios'
import {
  CButton,
  CButtonGroup,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'

const Stores = () => {
  const [columns, setColumns] = useState()
  const [data, setData] = useState([])
  const [visible, setVisible] = useState({
    add: false,
    edit: {},
    delete: {},
  })
  const [input, setInput] = useState({
    name: '',
    address: '',
    contact: '',
    lon: 0,
    lat: 0,
  })

  const getStores = async () => {
    const response = await Axios.get('http://localhost:3000/stores')
    const visible = {
      add: false,
      edit: {},
      delete: {},
    }
    await response.data.data.forEach((store) => {
      visible.edit[store.id] = false
      visible.delete[store.id] = false
    })
    setVisible((prevVisible) => {
      return {
        ...prevVisible,
        ...visible,
      }
    })

    setData(
      response.data.data.map((store) => {
        return {
          ...store,
          action: (
            <CButtonGroup role="group" aria-label="Basic action" key={`action_button_${store.id}`}>
              <CButton
                color="warning"
                onClick={() => {
                  setVisible((prevVisible) => ({
                    ...prevVisible,
                    edit: {
                      ...prevVisible.edit,
                      [store.id]: true,
                    },
                  }))
                }}
              >
                Edit
              </CButton>

              <CButton
                color="danger"
                onClick={() => {
                  setVisible((prevVisible) => ({
                    ...prevVisible,
                    delete: {
                      ...prevVisible.delete,
                      [store.id]: true,
                    },
                  }))
                }}
              >
                Delete
              </CButton>
            </CButtonGroup>
          ),
        }
      }),
    )
  }

  const addStore = async () => {
    const response = await Axios.post('http://localhost:3000/stores', input)
    if (response.status === 200) {
      getStores()
      setVisible({
        ...visible,
        add: false,
      })
    }
  }

  const editStore = async (id) => {
    const response = await Axios.patch(`http://localhost:3000/stores/${id}`, input)
    if (response.status === 200) {
      getStores()
    }
  }

  const deleteStore = async (id) => {
    const response = await Axios.delete(`http://localhost:3000/stores/${id}`)
    if (response.status === 200) {
      getStores()
    }
  }

  useEffect(() => {
    getStores()
  }, [])

  useEffect(() => {
    let columns = []
    if (data.length > 0) {
      for (const [key] of Object.entries(data[0])) {
        if (!key.includes('_id') && key !== 'id') {
          columns.push({
            name: key.replace('_', ' ').toUpperCase(),
            selector: (row) => row[key],
            sortable: true,
          })
        }
      }
      setColumns(columns)
    }
  }, [data])

  return (
    <>
      <CButton
        onClick={() => {
          setVisible({
            ...visible,
            add: true,
          })
        }}
        color="success"
      >
        Add Store
      </CButton>
      <CModal
        visible={visible.add}
        onClose={() => {
          setVisible({
            ...visible,
            add: false,
          })
        }}
      >
        <CModalHeader
          onClose={() => {
            setVisible({
              ...visible,
              add: false,
            })
          }}
        >
          <CModalTitle>Add New Store</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            id="floatingName"
            floatingLabel="Store name"
            placeholder="Name"
            onChange={(e) => {
              setInput({
                ...input,
                name: e.target.value,
              })
            }}
          />
          <CFormInput
            type="text"
            id="floatingAddress"
            floatingLabel="Store address"
            placeholder="Address"
            onChange={(e) => {
              setInput({
                ...input,
                address: e.target.value,
              })
            }}
          />
          <CFormInput
            type="text"
            id="floatingContact"
            floatingLabel="Store contact"
            placeholder="Contact"
            onChange={(e) => {
              setInput({
                ...input,
                contact: e.target.value,
              })
            }}
          />
          <CFormInput
            type="number"
            id="floatingLongitude"
            floatingLabel="Aspect Longitude"
            placeholder="Longitude"
            min={-180}
            max={180}
            onChange={(e) => {
              setInput({
                ...input,
                lon: parseFloat(e.target.value),
              })
            }}
          />
          <CFormInput
            type="number"
            id="floatingLatitude"
            floatingLabel="Aspect Latitude"
            placeholder="Latitude"
            min={-90}
            max={90}
            onChange={(e) => {
              setInput({
                ...input,
                lat: parseFloat(e.target.value),
              })
            }}
          />
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setVisible({
                ...visible,
                add: false,
              })
            }}
          >
            Close
          </CButton>
          <CButton color="primary" onClick={addStore}>
            Add New Store
          </CButton>
        </CModalFooter>
      </CModal>
      <DataTable columns={columns} data={data} />

      {data.map((store) => {
        return (
          <div key={store.id}>
            <CModal
              visible={visible.edit[store.id]}
              onClose={() => {
                setVisible((prevVisible) => ({
                  ...prevVisible,
                  edit: {
                    ...prevVisible.edit,
                    [store.id]: false,
                  },
                }))
              }}
            >
              <CModalHeader
                onClose={() => {
                  setVisible((prevVisible) => ({
                    ...prevVisible,
                    edit: {
                      ...prevVisible.edit,
                      [store.id]: true,
                    },
                  }))
                }}
              >
                <CModalTitle>Edit Store</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CFormInput
                  type="text"
                  id="floatingName"
                  floatingLabel="Store name"
                  placeholder="Name"
                  onChange={(e) => {
                    setInput({
                      ...input,
                      name: e.target.value,
                    })
                  }}
                  defaultValue={store.name}
                />
                <CFormInput
                  type="text"
                  id="floatingAddress"
                  floatingLabel="Store address"
                  placeholder="Address"
                  onChange={(e) => {
                    setInput({
                      ...input,
                      address: e.target.value,
                    })
                  }}
                  defaultValue={store.address}
                />
                <CFormInput
                  type="text"
                  id="floatingContact"
                  floatingLabel="Store contact"
                  placeholder="Contact"
                  onChange={(e) => {
                    setInput({
                      ...input,
                      contact: e.target.value,
                    })
                  }}
                  defaultValue={store.contact}
                />
                <CFormInput
                  type="number"
                  id="floatingLongitude"
                  floatingLabel="Aspect Longitude"
                  placeholder="Longitude"
                  min={-180}
                  max={180}
                  onChange={(e) => {
                    setInput({
                      ...input,
                      lon: parseFloat(e.target.value),
                    })
                  }}
                  defaultValue={store.lon}
                />
                <CFormInput
                  type="number"
                  id="floatingLatitude"
                  floatingLabel="Aspect Latitude"
                  placeholder="Latitude"
                  min={-90}
                  max={90}
                  onChange={(e) => {
                    setInput({
                      ...input,
                      lat: parseFloat(e.target.value),
                    })
                  }}
                  defaultValue={store.lat}
                />
              </CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() => {
                    setVisible((prevVisible) => ({
                      ...prevVisible,
                      edit: {
                        ...prevVisible.edit,
                        [store.id]: false,
                      },
                    }))
                  }}
                >
                  Close
                </CButton>
                <CButton color="primary" onClick={editStore.bind(this, store.id)}>
                  Edit Store
                </CButton>
              </CModalFooter>
            </CModal>

            <CModal
              visible={visible.delete[store.id]}
              onClose={() => {
                setVisible((prevVisible) => ({
                  ...prevVisible,
                  delete: {
                    ...prevVisible.delete,
                    [store.id]: false,
                  },
                }))
              }}
            >
              <CModalHeader
                onClose={() => {
                  setVisible((prevVisible) => ({
                    ...prevVisible,
                    delete: {
                      ...prevVisible.delete,
                      [store.id]: false,
                    },
                  }))
                }}
              >
                <CModalTitle>Delete Store</CModalTitle>
              </CModalHeader>
              <CModalBody>Are you sure you want to delete {store.name}?</CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() => {
                    setVisible((prevVisible) => ({
                      ...prevVisible,
                      delete: {
                        ...prevVisible.delete,
                        [store.id]: false,
                      },
                    }))
                  }}
                >
                  Close
                </CButton>
                <CButton color="primary" onClick={deleteStore.bind(this, store.id)}>
                  Delete Store
                </CButton>
              </CModalFooter>
            </CModal>
          </div>
        )
      })}
    </>
  )
}

export default Stores
