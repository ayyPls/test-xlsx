import React, { FC, useState } from 'react';
import './App.css';
import * as XLSX from 'xlsx';
import { Paper, TableContainer } from '@mui/material'
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';

type IVariable = {
  variableValue: string,
  attributes: {
    [key: string]: string,
  },
}

type ISheetRow = Array<string>

type ISheetList = {
  list: string,
  variableName: string,
  data: Array<IVariable>,
}


/* 
template for backend

{
  variableName: string,
  data: [
    {
      variableValue: string,
      attribute1: string,
      attribute2: string, 
      attribute3: string, 
      attribute4: string, 
    },
  ]
}

*/


// TODO: в одной эксель может быть на разных листах переменная с одинаковым названием

function App() {

  const [sheetTable, setSheetTable] = useState<Array<ISheetList>>([])
  const [currentTab, setCurrentTab] = useState(1)

  const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

    const getAttributeName = (attribute: string, attributeIndex: number) => {
      return attribute ? attribute : `attribute_${attributeIndex}`
    }

    const { files } = event.target;
    const fileReader = new FileReader();
    fileReader.onload = (ev) => {
      try {
        const workbook = XLSX.read(ev.target?.result, { type: 'binary' });
        // массив для списка листов файла
        const temp: Array<ISheetList> = []
        // итерация по листам файла

        Object.values(workbook.Sheets).map((sheet, index) => {
          // конвертируем в нужный формат
          const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' }) as ISheetRow[]
          // первая строка экселя
          const [variableSchemeArray, ...variablesData] = sheetData
          // берем название переменной и ее атрибуты из первой строки
          const [variableName, ...variableAttributes] = variableSchemeArray

          // форматируем в удобный формат данные по переменной
          const data: IVariable[] = sheetData.map(sheetRow => {
            return {
              variableValue: sheetRow[0],
              attributes: Object.fromEntries(variableAttributes.map(
                (attribute, attributeNumber) => [getAttributeName(attribute, attributeNumber), sheetRow[attributeNumber]]
              ))
            }
          })
          const [firstRow, ...other] = data

          temp.push({
            variableName,
            data: other,
            list: workbook.SheetNames[index],
          })
        })
        console.log(temp)
        setSheetTable(temp)

      } catch (e) {
        console.log('Неверный тип файла');
        return;
      }
    };
    if (files) {
      fileReader.readAsBinaryString(files[0]);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <input type='file' onChange={onFileUpload}></input>

        {sheetTable.length
          ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TableContainer component={Paper} sx={{ maxWidth: '80vw', maxHeight: '80vh' }}>
              <SheetListControl currentTab={currentTab} table={sheetTable} setCurrentTab={(val: number) => setCurrentTab(val)} />
              <>
                <Typography fontSize="16px">{sheetTable[currentTab - 1].variableName}</Typography>
                <Typography fontSize='14px' color="#1976D2">Переменная</Typography>
              </>
              <Table stickyHeader>
                {/* TODO: add head of table with variable attributes */}
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>

                  {sheetTable[currentTab - 1].data.map(
                    variable =>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox />
                        </TableCell>
                        <TableCell>{variable.variableValue}</TableCell>
                        {Object.entries(variable.attributes).map(
                          attribute => <TableCell>
                            {attribute[1]}
                          </TableCell>
                        )}
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          : null}
      </header>
    </div>
  );
}


const SheetListControl: FC<{ table: ISheetList[], currentTab: number, setCurrentTab: (newValue: number) => void }> = ({ table, currentTab, setCurrentTab }) => {
  return <Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)}>
    {table.map((sheet, index) => <Tab value={index + 1} color={currentTab === index + 1 ? '#1976D2' : undefined} label={sheet.list} />)}
  </Tabs>
}


export default App;
