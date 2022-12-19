import React, { useState } from 'react';
import './App.css';
import * as XLSX from 'xlsx';

type IVariable = {
  variableName: string,
  attributes: {
    [key: string]: string
  }
}

type ISheetRow = Array<string>

type ISheetList = {
  list: string,
  data: Array<IVariable>,
  variableScheme: IVariable
}



// TODO: в одной эксель может быть на разных листах переменная с одинаковым названием

// TODO: название атрибута может быть пустым => давать дефолтное название✅ или выкидывать ошибку

function App() {

  const [sheetTable, setSheetTable] = useState<Array<ISheetList>>([])

  const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

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


          // схема для переменной (содержит данные о названии переменной и ее атрибутах)
          const variableScheme: IVariable = {
            variableName,
            attributes: Object.fromEntries(variableAttributes.map((attr, index) => {
              // дефотное название для атрибута переменной, если встречается пустая строка
              let attrName = attr === '' ? `attribute_${index + 1}` : attr
              return [attrName, attrName]
            }))
          }

          const variablesDataPrettified: IVariable[] = variablesData.map(variable => {
            const [name, ...attrs] = variable
            const attrKeys = Object.keys(variableScheme.attributes)
            return {
              variableName: name,
              attributes: Object.fromEntries(attrs.map((attr, index) =>
                [attrKeys[index], attr]
              ))
            }
          }
          )
          // добавляем в массив листов отформатированные данные о переменных
          temp.push({
            list: workbook.SheetNames[index], data: variablesDataPrettified, variableScheme
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

  console.log(sheetTable)
  return (
    <div className="App">
      <header className="App-header">
        <input type='file' onChange={onFileUpload}></input>

        {/* {sheetTable.length ? */}
        {/* <table>
            <tbody>
              {
                sheetTable.map((list, index) =>
                  <tr key={index}>
                    <>
                      <tr><td>{`---------${list.title}---------`}</td></tr>
                      {list.data.map(
                        (row, index) =>
                          <tr key={index}>
                            {row.map(column =>
                              <td>{column}</td>
                            )
                            }
                          </tr>
                      )
                        // <tr key={index}><td>{JSON.stringify(row)}</td></tr>})
                      }
                    </>
                  </tr>

                )
              }
            </tbody>
          </table> */}
        {/* : <p>no data yet</p>   */}
        {/* } */}
      </header>
    </div>
  );
}

export default App;
