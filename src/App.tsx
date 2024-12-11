import {ChangeEvent, useEffect, useState} from 'react'

import {JOKES_API_URL, JOKES_COUNT, JOKES_FILTER_TIMEOUT} from "./constants.ts";
import {Joke} from "./types.ts";
import {debounce} from "./utils.ts";
import './App.css'

const App = () => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [filteredJokes, setFilteredJokes] = useState<Joke[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [filterValue, setFilterValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchJokesData = async () => {
      setIsLoading(true);
      try {
        const jokesRequests = new Array(JOKES_COUNT).fill(JOKES_API_URL)

        const responses = await Promise.all(jokesRequests.map((request) => fetch(request)))

        const dataPromises = responses.map(async (response): Promise<Joke> => {
          if (!response.ok) {
            throw new Error(`Fetch failed with status ${response.status}`);
          }

          return await response.json()
        })

        const jokesData = await Promise.all(dataPromises)
        setJokes(jokesData)
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setIsLoading(false);

        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('An unknown error occurred'));
        }
      }
    }

    fetchJokesData()
  }, []);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value)
  }

  useEffect(() => {
    const debounceFintering = debounce(() => {
      if (filterValue) {
        const filteredData = jokes.filter((joke) => {
          return joke.value.startsWith(filterValue);
        })

        setFilteredJokes(filteredData);

        return;
      }

      setFilteredJokes(jokes);
    }, JOKES_FILTER_TIMEOUT)

    debounceFintering();
  }, [jokes, filterValue]);

  if (error) {
    return <div>Error fetching jokes :(</div>
  }

  if (isLoading) {
    return <div>Loading the jokes...</div>
  }

  return (
    <>
      <h1>Chuck Norris Jokes</h1>
      <label className="jokes-filter-label">
        Filter Jokes:
        <input className="jokes-filter-input" type="text" name="jokes-filter" onChange={handleFilterChange} value={filterValue}/>
      </label>
      <table className="jokes-table">
        <thead className="table-head">
        <tr>
          <th className="table-column">Joke</th>
        </tr>
        </thead>
        <tbody>{filteredJokes.map((joke) => (
          <tr key={joke.id}>
            <td className="table-column">{joke.value}</td>
          </tr>
        ))}</tbody>
      </table>
    </>
  )
}

export default App
