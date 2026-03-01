import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function KnapsackSolver() {

    const [problems, setProblems] = useState(() => {
        // Connect with local storage for storing data values
        const saved = localStorage.getItem("knapsackProblems");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Local storage processing failed", e);
            }
        }
        return [
            {
                id: 1,
                name: "Problem 1",
                capacity: "50",   // store as string
                type: "ZERO_ONE",
                items: [{ weight: "30", value: "120" }],  // store as string
                result: null,
                loading: false,
                error: null,
            },
        ];
    });

    // Save to local storage whenever problems change
    useEffect(() => {
        localStorage.setItem("knapsackProblems", JSON.stringify(problems));
    }, [problems]);

    // Add new problem
    const addProblem = () => {

        const newId =
            problems.length
                ? Math.max(...problems.map(p => p.id)) + 1
                : 1;

        setProblems([
            ...problems,
            {
                id: newId,
                name: `Problem ${newId}`,
                capacity: "",
                type: "ZERO_ONE",
                items: [{ weight: "", value: "" }],
                result: null,
                loading: false,
                error: null,
            },
        ]);

    };


    // Remove problem
    const removeProblem = (id) => {

        if (problems.length === 1) return;

        setProblems(
            problems.filter(p => p.id !== id)
        );

    };


    // Update problem (store string)
    const updateProblem = (id, field, value) => {

        setProblems(
            problems.map(p =>
                p.id === id
                    ? { ...p, [field]: value }
                    : p
            )
        );

    };


    // Add item
    const addItem = (probId) => {

        setProblems(
            problems.map(p =>
                p.id === probId
                    ? {
                        ...p,
                        items: [
                            ...p.items,
                            { weight: "", value: "" },
                        ],
                    }
                    : p
            )
        );

    };


    // Remove item
    const removeItem = (probId, itemIdx) => {

        setProblems(
            problems.map(p =>
                p.id === probId && p.items.length > 1
                    ? {
                        ...p,
                        items: p.items.filter(
                            (_, i) => i !== itemIdx
                        ),
                    }
                    : p
            )
        );

    };


    // Update item (store string)
    const updateItem = (
        probId,
        itemIdx,
        field,
        value
    ) => {

        setProblems(
            problems.map(p =>
                p.id === probId
                    ? {
                        ...p,
                        items: p.items.map((item, i) =>
                            i === itemIdx
                                ? { ...item, [field]: value }
                                : item
                        ),
                    }
                    : p
            )
        );

    };


    // Convert problem to backend format
    const convertProblemToNumbers = (problem) => {

        return {
            capacity: Number(problem.capacity) || 0,
            type: problem.type,
            items: problem.items.map(item => ({
                weight: Number(item.weight) || 0,
                value: Number(item.value) || 0,
            })),
        };

    };


    // Solve single
    const solveSingle = async (probId) => {

        setProblems(
            problems.map(p =>
                p.id === probId
                    ? {
                        ...p,
                        loading: true,
                        error: null,
                        result: null,
                    }
                    : p
            )
        );

        const problem =
            problems.find(p => p.id === probId);

        if (!problem) return;

        try {

            const response =
                await axios.post(
                    "http://localhost:8080/api/knapsack/solve",
                    convertProblemToNumbers(problem)
                );

            setProblems(
                problems.map(p =>
                    p.id === probId
                        ? {
                            ...p,
                            result: response.data,
                            loading: false,
                            error: response.data.error || null,
                        }
                        : p
                )
            );

        } catch (err) {
            console.error(err);
            setProblems(
                problems.map(p =>
                    p.id === probId
                        ? {
                            ...p,
                            error: (err.response && err.response.data && err.response.data.error) ? err.response.data.error : "Failed to solve. Is backend running?",
                            loading: false,
                        }
                        : p
                )
            );

        }

    };


    // Solve all
    const solveAll = async () => {

        const promises =
            problems.map(async (problem) => {

                try {

                    const response =
                        await axios.post(
                            "http://localhost:8080/api/knapsack/solve",
                            convertProblemToNumbers(problem)
                        );

                    return {
                        id: problem.id,
                        result: response.data,
                        error: response.data.error || null,
                    };

                } catch (err) {

                    return {
                        id: problem.id,
                        result: null,
                        error: (err.response && err.response.data && err.response.data.error) ? err.response.data.error : "Failed",
                    };

                }

            });

        // Set loading state first
        setProblems(problems.map(p => ({
            ...p,
            loading: true,
            error: null,
            result: null,
        })));

        const results =
            await Promise.all(promises);

        setProblems(
            problems.map(p => {

                const res =
                    results.find(r => r.id === p.id);

                return {
                    ...p,
                    result: res?.result || null,
                    error: res?.error || null,
                    loading: false,
                };

            })
        );

    };


    return (

        <div className="container">

            <header>
                <h1>Knapsack Solver</h1>
                <p>Solve one problem at a time or all at once</p>
            </header>


            {problems.map((problem) => (

                <div key={problem.id} className="card problem-card">

                    <div className="problem-header">

                        <input
                            type="text"
                            className="problem-name-input"
                            value={problem.name}
                            onChange={(e) =>
                                updateProblem(
                                    problem.id,
                                    "name",
                                    e.target.value
                                )
                            }
                        />

                        {problems.length > 1 && (
                            <button
                                className="remove-btn"
                                onClick={() =>
                                    removeProblem(problem.id)
                                }
                            >
                                × Remove
                            </button>
                        )}

                    </div>


                    <label>Capacity</label>

                    <input
                        type="number"
                        value={problem.capacity}
                        onChange={(e) =>
                            updateProblem(
                                problem.id,
                                "capacity",
                                e.target.value
                            )
                        }
                    />


                    <div className="type-buttons">

                        <button
                            className={
                                problem.type === "ZERO_ONE"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                updateProblem(
                                    problem.id,
                                    "type",
                                    "ZERO_ONE"
                                )
                            }
                        >
                            0/1 Knapsack
                        </button>


                        <button
                            className={
                                problem.type === "FRACTIONAL"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                updateProblem(
                                    problem.id,
                                    "type",
                                    "FRACTIONAL"
                                )
                            }
                        >
                            Fractional
                        </button>

                    </div>


                    <h3>Items</h3>


                    {problem.items.map((item, idx) => (

                        <div key={idx} className="item-row">

                            <div className="input-with-helper">

                                <input
                                    type="number"
                                    value={item.weight}
                                    onChange={(e) =>
                                        updateItem(
                                            problem.id,
                                            idx,
                                            "weight",
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="helper-text">
                                    Weight
                                </span>

                            </div>


                            <div className="input-with-helper">

                                <input
                                    type="number"
                                    value={item.value}
                                    onChange={(e) =>
                                        updateItem(
                                            problem.id,
                                            idx,
                                            "value",
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="helper-text">
                                    Profit / Value
                                </span>

                            </div>


                            {problem.items.length > 1 && (
                                <button
                                    className="remove-item-btn"
                                    onClick={() =>
                                        removeItem(problem.id, idx)
                                    }
                                >
                                    ×
                                </button>
                            )}

                        </div>

                    ))}


                    <button
                        className="add-item-btn"
                        onClick={() =>
                            addItem(problem.id)
                        }
                    >
                        + Add Item
                    </button>


                    <div className="problem-actions">

                        <button
                            className="solve-single-btn"
                            onClick={() =>
                                solveSingle(problem.id)
                            }
                            disabled={problem.loading}
                        >
                            {problem.loading
                                ? "Solving..."
                                : "Solve This"}
                        </button>

                    </div>


                    {problem.result && !problem.error && (
                        <div className="result-box">
                            <strong>Max Profit:</strong>
                            {" "}
                            {problem.result.maxProfit}

                            {problem.result.selectedItems?.length > 0 && (
                                <div style={{ marginTop: '10px' }}>
                                    <strong>Selected Items:</strong>
                                    <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                        {problem.result.selectedItems.map((selItem, i) => {
                                            const isObject = typeof selItem === 'object' && selItem !== null;
                                            const itemIndex = isObject ? selItem.index : selItem;
                                            const fraction = isObject && selItem.fraction !== undefined ? selItem.fraction : 1;

                                            return (
                                                <li key={i} style={{ marginBottom: '4px' }}>
                                                    Item #{itemIndex + 1}
                                                    {isObject && selItem.profit !== undefined && (
                                                        <span style={{ fontWeight: '500', marginLeft: '6px' }}>
                                                            - Profit: {selItem.profit}
                                                        </span>
                                                    )}
                                                    {problem.type === "FRACTIONAL" && (
                                                        <span style={{ color: '#059669', fontWeight: '500', marginLeft: '6px' }}>
                                                            ({Math.round(fraction * 100)}% taken)
                                                        </span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}


                    {problem.error && (
                        <div className="error">
                            Error: {problem.error}
                        </div>
                    )}

                </div>

            ))}


            <div style={{ margin: "30px 0", textAlign: "center" }}>

                <button
                    className="add-problem-btn"
                    onClick={addProblem}
                >
                    + Add New Problem
                </button>


                <button
                    className="solve-all-btn"
                    onClick={solveAll}
                    style={{ marginLeft: "20px" }}
                >
                    Solve All Problems
                </button>

                <button
                    className="remove-btn"
                    onClick={() => {
                        if (window.confirm("Are you sure you want to clear all data?")) {
                            localStorage.removeItem("knapsackProblems");
                            window.location.reload();
                        }
                    }}
                    style={{ marginLeft: "20px", background: "#ef4444" }}
                >
                    Clear Data
                </button>

            </div>

        </div>

    );

}

export default KnapsackSolver;
