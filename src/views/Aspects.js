import React, { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import Axios from 'axios'
import {
  CButton,
  CButtonGroup,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import '@coreui/coreui/dist/css/coreui.min.css'

const Aspects = () => {
  const [columns, setColumns] = useState()
  const [data, setData] = useState([])
  const [visible, setVisible] = useState({
    add: false,
    edit: {},
    delete: {},
  })
  const [input, setInput] = useState({
    name: '',
    percentage: 0,
  })

  const { selected } = useSelector((state) => state.categories)

  const getAspects = async (category_id) => {
    const response = await Axios.get(`http://localhost:3000/aspects?category_id=${category_id}`)
    const visible = {
      add: false,
      edit: {},
      delete: {},
    }
    await response.data.data.forEach((aspect) => {
      visible.edit[aspect.id] = false
      visible.delete[aspect.id] = false
    })
    setVisible((prevVisible) => {
      return {
        ...prevVisible,
        ...visible,
      }
    })

    setData(
      response.data.data.map((aspect) => {
        return {
          ...aspect,
          action: (
            <CButtonGroup role="group" aria-label="Basic action" key={`action_button_${aspect.id}`}>
              <CButton
                color="warning"
                onClick={() => {
                  setVisible((prevVisible) => ({
                    ...prevVisible,
                    edit: {
                      ...prevVisible.edit,
                      [aspect.id]: true,
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
                      [aspect.id]: true,
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

  const addAspect = async () => {
    const response = await Axios.post(
      `http://localhost:3000/aspects?category_id=${selected}`,
      input,
    )
    if (response.status === 201) {
      getAspects(selected)
      setVisible({
        ...visible,
        add: false,
      })
    }
  }

  const editAspect = async (id) => {
    const response = await Axios.patch(`http://localhost:3000/aspects/${id}`, input)
    if (response.status === 200) {
      getAspects(selected)
    }
  }

  const deleteAspect = async (id) => {
    const response = await Axios.delete(`http://localhost:3000/aspects/${id}`)
    if (response.status === 200) {
      getAspects(selected)
    }
  }

  useEffect(() => {
    getAspects(selected)
  }, [selected])

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
        className="mb-3"
      >
        Add Aspect
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
          <CModalTitle>Add New Aspect</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={addAspect}>
          <CModalBody>
            <CFormInput
              className="mb-3"
              type="text"
              id="floatingName"
              floatingLabel="Aspect name"
              placeholder="Name"
              onChange={(e) => {
                setInput({
                  ...input,
                  name: e.target.value,
                })
              }}
              required
            />
            <CFormInput
              className="mb-3"
              type="number"
              id="floatingPercentage"
              floatingLabel="Aspect Percentage"
              placeholder="Percentage"
              min={0}
              max={100}
              onChange={(e) => {
                setInput({
                  ...input,
                  percentage: parseInt(e.target.value),
                })
              }}
              required
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
            <CButton color="primary" type="submit">
              Add New Aspect
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
      <DataTable columns={columns} data={data} pagination />

      {data.map((aspect) => {
        return (
          <div key={aspect.id}>
            <CModal
              visible={visible.edit[aspect.id]}
              onClose={() => {
                setVisible((prevVisible) => ({
                  ...prevVisible,
                  edit: {
                    ...prevVisible.edit,
                    [aspect.id]: false,
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
                      [aspect.id]: true,
                    },
                  }))
                }}
              >
                <CModalTitle>Edit Aspect</CModalTitle>
              </CModalHeader>
              <CForm onSubmit={() => editAspect(aspect.id)}>
                <CModalBody>
                  <CFormInput
                    className="mb-3"
                    type="text"
                    id="floatingName"
                    floatingLabel="Aspect name"
                    placeholder="Name"
                    onChange={(e) => {
                      setInput((inputPrev) => {
                        return {
                          ...inputPrev,
                          name: e.target.value,
                        }
                      })
                    }}
                    defaultValue={aspect.name}
                    required
                  />
                  <CFormInput
                    className="mb-3"
                    type="number"
                    id="floatingPercentage"
                    floatingLabel="Aspect Percentage"
                    placeholder="Percentage"
                    min={0}
                    max={100}
                    onChange={(e) => {
                      setInput((inputPrev) => {
                        return {
                          ...inputPrev,
                          percentage: e.target.value,
                        }
                      })
                    }}
                    defaultValue={aspect.percentage}
                    required
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
                          [aspect.id]: false,
                        },
                      }))
                    }}
                  >
                    Close
                  </CButton>
                  <CButton color="primary" type="submit">
                    Edit Aspect
                  </CButton>
                </CModalFooter>
              </CForm>
            </CModal>

            <CModal
              visible={visible.delete[aspect.id]}
              onClose={() => {
                setVisible((prevVisible) => ({
                  ...prevVisible,
                  delete: {
                    ...prevVisible.delete,
                    [aspect.id]: false,
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
                      [aspect.id]: false,
                    },
                  }))
                }}
              >
                <CModalTitle>Delete Aspect</CModalTitle>
              </CModalHeader>
              <CModalBody>Are you sure you want to delete {aspect.name}?</CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() => {
                    setVisible((prevVisible) => ({
                      ...prevVisible,
                      delete: {
                        ...prevVisible.delete,
                        [aspect.id]: false,
                      },
                    }))
                  }}
                >
                  Close
                </CButton>
                <CButton color="primary" onClick={deleteAspect.bind(this, aspect.id)}>
                  Delete Aspect
                </CButton>
              </CModalFooter>
            </CModal>
          </div>
        )
      })}
    </>
  )
}

export default Aspects
