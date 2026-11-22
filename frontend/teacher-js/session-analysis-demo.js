/* ==========================================
   CLARIQ - DEMO AI SESSION ANALYSIS
========================================== */

window.CLARIQ_SESSION_ANALYSIS = {

    "active-101": {

        totalDoubts: 18,

        participants: 14,

        aiSummary: `
            <p>
                Students have submitted doubts primarily related to
                pointers, arrays and functions in C programming.
                The largest concentration of confusion is around
                pointer declaration, dereferencing and memory addresses.
            </p>

            <p>
                Several questions also indicate difficulty understanding
                the relationship between arrays and pointers, especially
                how array elements can be accessed through pointer notation.
            </p>

            <p>
                A smaller group of students needs clarification about
                function arguments, parameter passing and the use of
                pointers with functions.
            </p>

            <p>
                <strong>Suggested focus:</strong>
                Begin with pointer fundamentals, then explain the
                connection between pointers and arrays before moving
                to their use in functions.
            </p>
        `,

        groups: [

            {
                id: "G001",

                title: "Pointer Basics",

                description:
                    "Students are facing confusion around pointer declaration, dereferencing and memory addresses.",

                doubtCount: 7,

                studentCount: 6,

                doubts: [

                    {
                        id: "D001",

                        question:
                            "Why do we use * while declaring a pointer?",

                        topic: "Pointers",

                        subtopic: "Pointer Declaration",

                        tags: ["Conceptual"]
                    },

                    {
                        id: "D002",

                        question:
                            "What exactly does dereferencing a pointer mean?",

                        topic: "Pointers",

                        subtopic: "Dereferencing",

                        tags: ["Conceptual", "Syntax"]
                    },

                    {
                        id: "D003",

                        question:
                            "How does a pointer store and access a memory address?",

                        topic: "Pointers",

                        subtopic: "Pointer Basics",

                        tags: ["Conceptual"]
                    },

                    {
                        id: "D004",

                        question:
                            "What is the difference between & and * operators?",

                        topic: "Pointers",

                        subtopic: "Pointer Operators",

                        tags: ["Comparison"]
                    }

                ]
            },


            {
                id: "G002",

                title: "Pointers and Arrays",

                description:
                    "Questions indicate difficulty understanding the relationship between arrays and pointers.",

                doubtCount: 5,

                studentCount: 4,

                doubts: [

                    {
                        id: "D005",

                        question:
                            "Why does an array name behave like a pointer?",

                        topic: "Arrays",

                        subtopic: "Array Basics",

                        tags: ["Conceptual"]
                    },

                    {
                        id: "D006",

                        question:
                            "How can we access array elements using pointers?",

                        topic: "Pointers",

                        subtopic: "Pointers and Arrays",

                        tags: ["Application"]
                    },

                    {
                        id: "D007",

                        question:
                            "What is the difference between an array and a pointer?",

                        topic: "Arrays",

                        subtopic: "Array and Pointer Relationship",

                        tags: ["Comparison"]
                    }

                ]
            },


            {
                id: "G003",

                title: "Pointer Arithmetic",

                description:
                    "Students are uncertain about pointer increment, decrement and address movement.",

                doubtCount: 3,

                studentCount: 3,

                doubts: [

                    {
                        id: "D008",

                        question:
                            "What happens when we increment a pointer?",

                        topic: "Pointers",

                        subtopic: "Pointer Arithmetic",

                        tags: ["Conceptual"]
                    },

                    {
                        id: "D009",

                        question:
                            "Why does pointer arithmetic depend on the data type?",

                        topic: "Pointers",

                        subtopic: "Pointer Arithmetic",

                        tags: ["Conceptual"]
                    }

                ]
            },


            {
                id: "G004",

                title: "Functions and Parameter Passing",

                description:
                    "Students need clarification about how values and addresses are passed to functions.",

                doubtCount: 3,

                studentCount: 3,

                doubts: [

                    {
                        id: "D010",

                        question:
                            "What is the difference between call by value and call by reference?",

                        topic: "Functions",

                        subtopic: "Parameter Passing",

                        tags: ["Comparison"]
                    },

                    {
                        id: "D011",

                        question:
                            "How can pointers be used to modify variables inside a function?",

                        topic: "Pointers",

                        subtopic: "Pointers with Functions",

                        tags: ["Application"]
                    }

                ]
            }

        ]

    },


    "active-102": {

        totalDoubts: 12,

        participants: 9,

        aiSummary: `
            <p>
                Students are primarily facing difficulties with Python
                functions, lists and dictionary operations.
            </p>

            <p>
                A recurring pattern is confusion around function
                arguments, mutable data structures and accessing
                dictionary values.
            </p>

            <p>
                <strong>Suggested focus:</strong>
                Clarify function arguments and demonstrate how lists
                and dictionaries behave when passed to functions.
            </p>
        `,

        groups: [

            {
                id: "G101",

                title: "Function Arguments",

                description:
                    "Questions relate to passing arguments, default values and function behaviour.",

                doubtCount: 5,

                studentCount: 4,

                doubts: [

                    {
                        id: "D101",

                        question:
                            "How do default arguments work in Python?",

                        topic: "Functions",

                        subtopic: "Default Arguments",

                        tags: ["Conceptual"]
                    },

                    {
                        id: "D102",

                        question:
                            "What happens if a function receives fewer arguments than expected?",

                        topic: "Functions",

                        subtopic: "Function Arguments",

                        tags: ["Application"]
                    }

                ]
            },


            {
                id: "G102",

                title: "Lists and Mutability",

                description:
                    "Students are confused about list modification and mutable objects.",

                doubtCount: 4,

                studentCount: 3,

                doubts: [

                    {
                        id: "D103",

                        question:
                            "Why does changing a list inside a function affect the original list?",

                        topic: "Lists",

                        subtopic: "List Mutability",

                        tags: ["Conceptual"]
                    },

                    {
                        id: "D104",

                        question:
                            "What is the difference between append and extend?",

                        topic: "Lists",

                        subtopic: "List Methods",

                        tags: ["Comparison"]
                    }

                ]
            },


            {
                id: "G103",

                title: "Dictionary Operations",

                description:
                    "Questions focus on accessing, updating and handling dictionary values.",

                doubtCount: 3,

                studentCount: 2,

                doubts: [

                    {
                        id: "D105",

                        question:
                            "How do we access a value using its key?",

                        topic: "Dictionaries",

                        subtopic: "Accessing Values",

                        tags: ["Syntax"]
                    }

                ]
            }

        ]

    }

};